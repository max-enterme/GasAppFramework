/**
 * Repository Module - Google Spreadsheet Adapter
 */

import type * as RepositoryTypes from './Types';
import { RepositoryError } from './Errors';

type Options = {
    headerRow?: number;
    softDelete?: { enabled: boolean; flagField: string; trueValue?: any };
    nullAsEmpty?: boolean;
    textPrefixApostrophe?: boolean;
};

export class SpreadsheetStore<TEntity extends object, Key extends keyof TEntity>
    implements RepositoryTypes.Ports.Store<TEntity>
{
    constructor(
        private sheetId: string,
        private sheetName: string,
        private schema: RepositoryTypes.Ports.Schema<TEntity, Key>,
        private options: Options = {}
    ) {}

    private getSheet_() {
        const ss = SpreadsheetApp.openById(this.sheetId);
        const sh = ss.getSheetByName(this.sheetName);
        if (!sh)
            throw new RepositoryError('StoreError', `Sheet not found: ${this.sheetName}`);
        return sh;
    }

    private ensureHeaders_(sh: GoogleAppsScript.Spreadsheet.Sheet, required: string[], headerRow1Based: number): string[] {
        const lastColumn = Math.max(1, sh.getLastColumn());
        const headerValues = sh.getRange(headerRow1Based, 1, 1, lastColumn).getValues()[0] ?? [];
        const header = headerValues.map((v) => String(v ?? '')).map((s) => s.trim());

        const existing = new Set(header.filter((h) => h.length > 0));
        const missing = required
            .map((h) => String(h ?? '').trim())
            .filter((h) => h.length > 0 && !existing.has(h));

        if (!missing.length) return header;

        const newHeader = header.concat(missing);
        sh.getRange(headerRow1Based, 1, 1, newHeader.length).setValues([newHeader]);
        return newHeader;
    }

    load(): { rows: TEntity[] } {
        const sh = this.getSheet_();
        const values = sh.getDataRange().getValues();
        const headerRow = Math.max(1, this.options.headerRow ?? 1) - 1;
        if (values.length <= headerRow) return { rows: [] };
        const requiredHeaders = this.schema.parameters.map((p) => String(p));
        const header = this.ensureHeaders_(sh, requiredHeaders, headerRow + 1);
        const nameToIdx = new Map<string, number>();
        for (let i = 0; i < header.length; i++) {
            const h = header[i];
            if (!h) continue;
            if (nameToIdx.has(h))
                throw new RepositoryError('HeaderDuplicate', `duplicate header: ${h}`);
            nameToIdx.set(h, i);
        }
        // Missing headers are auto-appended by ensureHeaders_().
        const rows: TEntity[] = [];
        for (let r = headerRow + 1; r < values.length; r++) {
            const raw: any = {};
            for (const p of this.schema.parameters) {
                const c = nameToIdx.get(String(p))!;
                raw[String(p)] = values[r][c];
            }
            const rec = this.schema.onAfterLoad ? this.schema.onAfterLoad(raw) : raw;
            rows.push(this.schema.fromPartial(rec));
        }
        return { rows };
    }

    saveAdded(rows: TEntity[]): void {
        if (!rows.length) return;
        const sh = this.getSheet_();
        const headerRow = Math.max(1, this.options.headerRow ?? 1) - 1;
        const requiredHeaders = this.schema.parameters.map((p) => String(p));
        const header = this.ensureHeaders_(sh, requiredHeaders, headerRow + 1);
        const nameToIdx = new Map<string, number>();
        for (let i = 0; i < header.length; i++) nameToIdx.set(header[i], i);
        const data: any[][] = [];
        for (const e of rows) {
            const row: any[] = new Array(header.length).fill('');
            for (const p of this.schema.parameters) {
                const c = nameToIdx.get(String(p))!;
                let v: any = (e as any)[String(p)];
                if (v == null && this.options.nullAsEmpty) v = '';
                if (
                    this.options.textPrefixApostrophe &&
                    typeof v === 'string' &&
                    v.length &&
                    v[0] == '='
                )
                    v = "'" + v;
                row[c] = v;
            }
            data.push(row);
        }
        const startR = sh.getLastRow() + 1;
        sh.getRange(startR, 1, data.length, data[0].length).setValues(data);
    }

    saveUpdated(rows: { index: number; row: TEntity }[]): void {
        if (!rows.length) return;
        const sh = this.getSheet_();
        const headerRow = Math.max(1, this.options.headerRow ?? 1) - 1;
        const requiredHeaders = this.schema.parameters.map((p) => String(p));
        const header = this.ensureHeaders_(sh, requiredHeaders, headerRow + 1);
        const nameToIdx = new Map<string, number>();
        for (let i = 0; i < header.length; i++) nameToIdx.set(header[i], i);

        // 連続ブロックごとにまとめて setValues
        rows.sort((a, b) => a.index - b.index);
        let block: { r0: number; rows: any[][] } | null = null;
        const flush = () => {
            if (!block) return;
            const r = headerRow + 2 + block.r0; // data starts at +2 (1-based next row after header)
            const h = sh.getRange(r, 1, block.rows.length, header.length);
            h.setValues(block.rows);
            block = null;
        };

        for (const it of rows) {
            const rowArr: any[] = new Array(header.length).fill('');
            for (const p of this.schema.parameters) {
                const c = nameToIdx.get(String(p))!;
                let v: any = (it.row as any)[String(p)];
                if (v == null && this.options.nullAsEmpty) v = '';
                if (
                    this.options.textPrefixApostrophe &&
                    typeof v === 'string' &&
                    v.length &&
                    v[0] == '='
                )
                    v = "'" + v;
                rowArr[c] = v;
            }
            if (!block) block = { r0: it.index, rows: [rowArr] };
            else if (block.r0 + block.rows.length === it.index) block.rows.push(rowArr);
            else {
                flush();
                block = { r0: it.index, rows: [rowArr] };
            }
        }
        flush();
    }

    deleteByIndexes(indexes: number[]): void {
        if (!indexes.length) return;
        const sh = this.getSheet_();
        const headerRow = Math.max(1, this.options.headerRow ?? 1) - 1;
        indexes.sort((a, b) => b - a); // delete from bottom
        if (this.options.softDelete?.enabled) {
            const flag = this.options.softDelete.flagField;
            const trueVal = this.options.softDelete.trueValue ?? true;
            const requiredHeaders = this.schema.parameters.map((p) => String(p));
            const header = this.ensureHeaders_(sh, requiredHeaders, headerRow + 1);
            const nameToIdx = new Map<string, number>();
            for (let i = 0; i < header.length; i++) nameToIdx.set(header[i], i);
            const col = nameToIdx.get(flag);
            if (col == null)
                throw new RepositoryError(
                    'HeaderMissing',
                    `missing softDelete flag column: ${flag}`
                );
            for (const idx of indexes) {
                const r = headerRow + 2 + idx;
                sh.getRange(r, col + 1).setValue(trueVal);
            }
        } else {
            for (const idx of indexes) {
                const r = headerRow + 2 + idx;
                sh.deleteRow(r);
            }
        }
    }
}

/**
 * Repository Module - Google Spreadsheet Adapter
 */
import type * as RepositoryTypes from './Types';
type Options = {
    headerRow?: number;
    softDelete?: {
        enabled: boolean;
        flagField: string;
        trueValue?: any;
    };
    nullAsEmpty?: boolean;
    textPrefixApostrophe?: boolean;
};
export declare class SpreadsheetStore<TEntity extends object, Key extends keyof TEntity> implements RepositoryTypes.Ports.Store<TEntity> {
    private sheetId;
    private sheetName;
    private schema;
    private options;
    constructor(sheetId: string, sheetName: string, schema: RepositoryTypes.Ports.Schema<TEntity, Key>, options?: Options);
    private getSheet_;
    load(): {
        rows: TEntity[];
    };
    saveAdded(rows: TEntity[]): void;
    saveUpdated(rows: {
        index: number;
        row: TEntity;
    }[]): void;
    deleteByIndexes(indexes: number[]): void;
}
export {};
//# sourceMappingURL=SpreadsheetAdapter.d.ts.map
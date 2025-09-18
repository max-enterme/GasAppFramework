# SpreadsheetRepository Pattern

The SpreadsheetRepository pattern provides a convenient inheritance-based approach for creating type-safe repositories that use Google Sheets as storage. This pattern simplifies repository creation and promotes code reuse.

## Overview

Instead of directly using `Repository.Adapters.GAS.SpreadsheetStore`, you can now extend the base `SpreadsheetRepository` class to create domain-specific repositories with clean APIs.

## Base Class

```typescript
namespace YTamaLeagueManagement.Repositories {
    export abstract class SpreadsheetRepository<TEntity extends object, Key extends keyof TEntity> {
        constructor(
            sheetId: string,
            sheetName: string,
            schema: Repository.Ports.Schema<TEntity, Key>,
            logger?: Shared.Types.Logger
        )
    }
}
```

## Usage Pattern

### 1. Define Your Entity and Schema

```typescript
export interface ExclusiveMember {
    channelId: string
    channelName: string
    joinedAt: Date
    isActive: boolean
}

export const ExclusiveMemberRepositorySchema: Repository.Ports.Schema<ExclusiveMember, 'channelId'> = {
    parameters: ['channelId', 'channelName', 'joinedAt', 'isActive'],
    keyParameters: ['channelId'],
    instantiate(): ExclusiveMember {
        return {
            channelId: '',
            channelName: '',
            joinedAt: new Date(),
            isActive: true
        }
    },
    fromPartial(p: Partial<ExclusiveMember>): ExclusiveMember {
        return {
            channelId: p.channelId || '',
            channelName: p.channelName || '',
            joinedAt: p.joinedAt || new Date(),
            isActive: p.isActive ?? true
        }
    }
}
```

### 2. Create Your Repository Class

```typescript
export class ExclusiveMemberRepository extends SpreadsheetRepository<ExclusiveMember, 'channelId'> {
    constructor(sheetId: string, sheetName: string = 'ExclusiveMembers', logger?: Shared.Types.Logger) {
        super(sheetId, sheetName, ExclusiveMemberRepositorySchema, logger)
    }

    // Domain-specific methods
    findByChannelId(channelId: string): ExclusiveMember | null {
        return this.find({ channelId })
    }

    getActiveMembers(): ExclusiveMember[] {
        return this.entities.filter(member => member.isActive)
    }
}
```

### 3. Use Your Repository

```typescript
const memberRepo = new YTamaLeagueManagement.Repositories.ExclusiveMemberRepository(
    'your-sheet-id',
    'ExclusiveMembers'
)

// Load data from sheet
memberRepo.load()

// Add new member
memberRepo.upsert({
    channelId: 'ch123',
    channelName: 'New Channel',
    isActive: true
})

// Find member
const member = memberRepo.findByChannelId('ch123')

// Get all active members
const activeMembers = memberRepo.getActiveMembers()
```

## Key Features

### Constructor Pattern
- **sheetId**: Google Sheet ID (required)
- **sheetName**: Sheet name with sensible defaults (optional)
- **schema**: Type-safe schema reference (required)
- **logger**: Optional logger for debugging (optional)

### Inherited Methods
All repositories inherit these methods from the base class:
- `load()`: Load data from spreadsheet
- `find(key)`: Find single entity by key
- `findAll(keys)`: Find multiple entities by keys
- `upsert(input)`: Insert or update entities
- `delete(keys)`: Delete entities by keys
- `entities`: Get all loaded entities (property)

### Type Safety
- Generic `<TEntity, Key>` ensures type safety
- Key parameter type is enforced (e.g., 'channelId', 'sessionId', 'teamId')
- Schema validation ensures data integrity

## Examples

### Game Session Repository
```typescript
export interface GameSession {
    sessionId: string
    gameType: string
    startTime: Date
    endTime?: Date
    playerCount: number
    isActive: boolean
}

export class GameSessionRepository extends SpreadsheetRepository<GameSession, 'sessionId'> {
    constructor(sheetId: string, sheetName: string = 'GameSessions', logger?: Shared.Types.Logger) {
        super(sheetId, sheetName, GameSessionRepositorySchema, logger)
    }

    findBySessionId(sessionId: string): GameSession | null {
        return this.find({ sessionId })
    }

    getActiveSessions(): GameSession[] {
        return this.entities.filter(session => session.isActive)
    }

    getSessionsByGameType(gameType: string): GameSession[] {
        return this.entities.filter(session => session.gameType === gameType)
    }

    endSession(sessionId: string): boolean {
        const session = this.findBySessionId(sessionId)
        if (session) {
            const updated = { ...session, isActive: false, endTime: new Date() }
            this.upsert(updated)
            return true
        }
        return false
    }
}
```

### League Team Repository
```typescript
export interface LeagueTeam {
    teamId: string
    teamName: string
    leagueId: string
    ownerId: string
    points: number
    isActive: boolean
}

export class LeagueTeamRepository extends SpreadsheetRepository<LeagueTeam, 'teamId'> {
    constructor(sheetId: string, sheetName: string = 'LeagueTeams', logger?: Shared.Types.Logger) {
        super(sheetId, sheetName, LeagueTeamRepositorySchema, logger)
    }

    findByTeamId(teamId: string): LeagueTeam | null {
        return this.find({ teamId })
    }

    getTeamsByLeague(leagueId: string): LeagueTeam[] {
        return this.entities.filter(team => team.leagueId === leagueId && team.isActive)
    }

    updateTeamPoints(teamId: string, points: number): boolean {
        const team = this.findByTeamId(teamId)
        if (team) {
            const updated = { ...team, points }
            this.upsert(updated)
            return true
        }
        return false
    }

    getLeaderboard(leagueId: string): LeagueTeam[] {
        return this.getTeamsByLeague(leagueId)
            .sort((a, b) => b.points - a.points)
    }
}
```

## Benefits

1. **Code Reuse**: Base class handles common repository operations
2. **Type Safety**: Full TypeScript support with generics
3. **Clean APIs**: Domain-specific methods for better usability
4. **Consistent Pattern**: Standardized constructor and method signatures
5. **Easy Testing**: Can be mocked or tested with in-memory stores
6. **Schema Validation**: Built-in validation and transformation
7. **Flexible Keys**: Support for different key types (string, composite keys, etc.)

## Migration from Direct SpreadsheetStore Usage

### Before
```typescript
const store = new Repository.Adapters.GAS.SpreadsheetStore(
    sheetId, 'ExclusiveMembers', schema
)

const repository = Repository.Engine.create({
    schema,
    store,
    keyCodec: Repository.Codec.simple(),
    logger
})
```

### After
```typescript
const repository = new YTamaLeagueManagement.Repositories.ExclusiveMemberRepository(
    sheetId, 'ExclusiveMembers', logger
)
```

The new pattern reduces boilerplate code and provides a more intuitive API for repository creation and usage.
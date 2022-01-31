export interface TableProps {
    tableName: string,
    primaryKey: string,
    createLambdaPath?: string,
    readLambdaPath?: string,
    updateLambdaPath?: string,
    deleteLambdaPath?: string,
    secondaryIndexes?: string[]
}
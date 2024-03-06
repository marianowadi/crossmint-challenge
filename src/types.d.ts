type Soloon = 'SOLOON'
type Cometh = 'COMETH'
export type Direction = 'RIGHT' | 'LEFT' | 'UP' | 'DOWN'
export type Color = 'WHITE' | 'BLUE' | 'RED' | 'PURPLE'
export type ComethOptions = `${Direction}_${Cometh}`
type SoloonOptions = `${Color}_${Soloon}`
type AstralObject = 'SPACE' | 'POLYANET' | ComethOptions | SoloonOptions
export type ApiAstralObject = 'soloons' | 'polyanets' | 'comeths'
type ApiCallPayload = {
  apiAstralObject: ApiAstralObject
  row: number
  column: number
  color?: Color
  direction?: Direction
}
export type GoalMapResponse = {
  goal: Array<AstralObject[]>
}

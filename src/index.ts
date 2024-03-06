import 'dotenv/config'
import {
  ApiCallPayload,
  AstralObject,
  GoalMapResponse,
  ApiAstralObject,
  Direction,
  Color,
} from './types'

const BASE_API_URL = 'https://challenge.crossmint.io/api/'
const CANDIDATE_ID = process.env.CANDIDATE_ID
const PHASE = process.env.PHASE
if (!CANDIDATE_ID) throw Error('Missing candidate ID')
if (!PHASE) throw Error('Missing Phase value')

const BASE_PAYLOAD = { candidateId: CANDIDATE_ID }

const apiCall = (payload: ApiCallPayload) => {
  const { row, column, apiAstralObject } = payload
  const data = {
    ...BASE_PAYLOAD,
    row,
    column,
    ...(apiAstralObject === 'comeths' ? { direction: payload.direction } : {}),
    ...(apiAstralObject === 'soloons' ? { color: payload.color } : {}),
  }

  return fetch(`${BASE_API_URL}${apiAstralObject}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

async function main() {
  try {
    if (PHASE === 'ONE') {
      await buildPolyanets()
    } else if (PHASE === 'TWO') {
      await buildCrossmingLogo()
    } else {
      throw Error('Wrong Phase value, must be "ONE" or "TWO"')
    }
  } catch (error) {
    console.error(error)
  }
}

const buildPolyanets = async () => {
  console.log('DEBUG: Creating the megaverse, please wait...')
  const MEGAVERSE_CENTER_ROW = 5
  const MEGAVERSE_CENTER_COL = 5
  let modifiedRows = 0
  while (modifiedRows < 4) {
    if (modifiedRows === 0) {
      await apiCall({
        apiAstralObject: 'polyanets',
        row: MEGAVERSE_CENTER_ROW,
        column: MEGAVERSE_CENTER_COL,
      })
    } else {
      await Promise.all([
        await apiCall({
          apiAstralObject: 'polyanets',
          row: MEGAVERSE_CENTER_ROW - modifiedRows,
          column: MEGAVERSE_CENTER_COL + modifiedRows,
        }),
        await apiCall({
          apiAstralObject: 'polyanets',
          row: MEGAVERSE_CENTER_ROW - modifiedRows,
          column: MEGAVERSE_CENTER_COL - modifiedRows,
        }),
        await apiCall({
          apiAstralObject: 'polyanets',
          row: MEGAVERSE_CENTER_ROW + modifiedRows,
          column: MEGAVERSE_CENTER_COL + modifiedRows,
        }),
        await apiCall({
          apiAstralObject: 'polyanets',
          row: MEGAVERSE_CENTER_ROW + modifiedRows,
          column: MEGAVERSE_CENTER_COL - modifiedRows,
        }),
      ])
    }
    modifiedRows++
  }
  console.log('DEBUG: The megaverse has been created!')
}

const buildCrossmingLogo = async () => {
  const goalMap = await fetch(`${BASE_API_URL}/map/${CANDIDATE_ID}/goal`)
  const { goal } = (await goalMap.json()) as GoalMapResponse
  const map: Array<Array<'SPACE'>> = new Array(30)
  for (var i = 0; i < map.length; i++) {
    map[i] = new Array(30).fill('SPACE')
  }
  // Added delay to avoid getting 429'ed by the API
  let delay = 0
  const DELAY_VALUE = 3000

  const promises: any[] = []
  for await (const [rowIndex, row] of goal.entries()) {
    for await (const [colIndex, column] of row.entries()) {
      const mapValue = map[rowIndex][colIndex]
      if (column !== mapValue) {
        delay += DELAY_VALUE
        promises.push(
          new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
            apiCall({
              row: rowIndex,
              column: colIndex,
              ...parsePayload(column),
            })
          )
        )
      }
    }
  }

  try {
    await Promise.all(promises)
  } catch (error) {
    console.error(error)
  }
}

const parsePayload = (value: AstralObject) => {
  if (value === 'POLYANET') {
    return { apiAstralObject: `${value.toLowerCase()}s` as ApiAstralObject }
  } else if (value.includes('COMETH')) {
    const [direction, astralObject] = value.toLowerCase().split('_')
    return {
      apiAstralObject: `${astralObject}s` as ApiAstralObject,
      direction: direction as Direction,
    }
  }
  {
    const [color, astralObject] = value.toLowerCase().split('_')
    return {
      apiAstralObject: `${astralObject}s` as ApiAstralObject,
      color: color as Color,
    }
  }
}

main()

import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse'
import { fileURLToPath } from 'url'

const readCSV = async (filePath: string) => {
  const rows: string[][] = []
  return new Promise<string[][]>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ';', fromLine: 2 })) // Skip the header
      .on('data', (row: string[]) => rows.push(row.filter(Boolean)))
      .on('end', () => resolve(rows))
      .on('error', reject)
  })
}

export const readFixture = async (fileName: string) => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const filePath = path.join(__dirname, fileName)
  const rows = await readCSV(filePath)
  return rows
}

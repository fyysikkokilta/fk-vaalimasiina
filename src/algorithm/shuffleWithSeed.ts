import seedrandom from 'seedrandom'

function seedRand(func: seedrandom.PRNG, min: number, max: number): number {
  return Math.floor(func() * (max - min + 1)) + min
}

export function shuffleWithSeed<T>(arr: T[], seed: string): T[] {
  const rng = seedrandom(seed)
  const resp: T[] = []
  const keys = Object.keys(Array.from({ length: arr.length }))

  for (let i = 0; i < arr.length; i++) {
    const r = seedRand(rng, 0, keys.length - 1)
    const g = keys[r]
    keys.splice(r, 1)
    resp.push(arr[Number(g)])
  }

  return resp
}

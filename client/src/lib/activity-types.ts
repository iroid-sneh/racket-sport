import { generateId } from "@/lib/utils"

export interface Activity {
  id: string
  title: string
  duration: string
  minCapacity: string
  maxCapacity: string
  pricePerPlayer: string
  allCoaches: boolean
  coachIds: string[]
  levelRestriction: boolean
  levelMin: number
  levelMax: number
  upperLevelAccess: boolean
  partnerMode: boolean
  expanded: boolean
}

export function newActivity(): Activity {
  return {
    id: generateId(),
    title: "",
    duration: "60",
    minCapacity: "2",
    maxCapacity: "8",
    pricePerPlayer: "",
    allCoaches: false,
    coachIds: [],
    levelRestriction: false,
    levelMin: 1,
    levelMax: 5,
    upperLevelAccess: false,
    partnerMode: false,
    expanded: true,
  }
}

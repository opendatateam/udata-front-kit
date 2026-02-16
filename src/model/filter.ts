export interface FilterOption {
  name: string
  id: string
  disabled?: boolean
  count?: number
}

export interface FilterState {
  id: string
  selectedValue: string | null
  options: FilterOption[]
  childId: string | null
}

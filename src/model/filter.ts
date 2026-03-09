export interface FilterOption {
  name: string
  id: string
  disabled?: boolean
}

export interface FilterState {
  id: string
  selectedValue: string | null
  options: FilterOption[]
  childId: string | null
}

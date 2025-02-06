export interface TagSelectOption {
  name: string
  id: string
  disabled?: boolean
}

export interface ResolvedTag {
  color: string
  value: string
  type: string
}

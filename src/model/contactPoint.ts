// FIXME: import from datagouv-components when >= 2.0.6
export interface ContactPoint {
  id: string
  name: string
  contact_form?: string
  email?: string
  role: string
}

export interface ContactPointRole {
  id: string
  label: string
}

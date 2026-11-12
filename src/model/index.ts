import type { Owned } from '@datagouv/components-next'

export type WithOwned<T> = T & Owned

// mirrors components-next TitleTag, which is not exported
export type TitleTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'

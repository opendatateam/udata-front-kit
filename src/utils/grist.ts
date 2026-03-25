import axios from 'axios'

export type GristRecord = {
  id: number
  fields: Record<string, unknown>
}

const cleanRecordLists = (record: GristRecord) => {
  for (const field in record.fields) {
    if (Array.isArray(record.fields[field])) {
      const array = record.fields[field] as unknown[]
      if (array.length > 0 && array[0] === 'L') {
        record.fields[field] = array.slice(1)
      }
    }
  }
  return record
}

export const createGristClient = (gristId: string) => {
  const gristUrl = `https://grist.numerique.gouv.fr/api/docs/${gristId}`

  return {
    imageUrl: (attachmentId: number): string => {
      return `${gristUrl}/attachments/${attachmentId}/download`
    },

    getRecords: async (
      tableId: string,
      filter = {},
      extraParams = {}
    ): Promise<GristRecord[]> => {
      const url = `${gristUrl}/tables/${tableId}/records`
      const response = await axios.get(url, {
        params: { filter: JSON.stringify(filter), ...extraParams }
      })
      return response.data.records.map(cleanRecordLists)
    },

    getRecordsByIds: async (
      tableId: string,
      recordsIds: number[]
    ): Promise<GristRecord[]> => {
      return createGristClient(gristId).getRecords(tableId, { id: recordsIds })
    },

    getRecord: async (
      tableId: string,
      recordId: number
    ): Promise<GristRecord> => {
      const records = await createGristClient(gristId).getRecordsByIds(
        tableId,
        [recordId]
      )
      return records[0]
    }
  }
}

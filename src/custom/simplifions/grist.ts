import axios from 'axios'

const grist_id = 'ofSVjCSAnMb6'
const grist_url = `https://grist.numerique.gouv.fr/api/docs/${grist_id}`

const cleanRecordLists = (record: GristRecord) => {
  for (const field in record.fields) {
    if (Array.isArray(record.fields[field])) {
      const array = record.fields[field]
      if (array.length > 0 && array[0] === 'L') {
        record.fields[field] = array.slice(1)
      }
    }
  }
  return record
}

export type GristRecord = {
  id: number
  fields: Record<string, unknown>
}

export const grist = {
  imageUrl: (attachment_id: number): string => {
    return `${grist_url}/attachments/${attachment_id}/download`
  },

  getRecords: async (
    table_id: string,
    filter = {},
    extraParams = {}
  ): Promise<GristRecord[]> => {
    const url = `${grist_url}/tables/${table_id}/records`
    const response = await axios.get(url, {
      params: { filter: JSON.stringify(filter), ...extraParams }
    })
    return response.data['records'].map(cleanRecordLists)
  },

  getRecordsByIds: async (
    table_id: string,
    records_ids: number[]
  ): Promise<GristRecord[]> => {
    return grist.getRecords(table_id, { id: records_ids })
  },

  getRecord: async (
    table_id: string,
    record_id: number
  ): Promise<GristRecord> => {
    const records = await grist.getRecordsByIds(table_id, [record_id])
    return records[0]
  }
}

import axios from 'axios'

const grist_id = 'ofSVjCSAnMb6'
const grist_url = `https://grist.numerique.gouv.fr/api/docs/${grist_id}`

const imageUrl = (attachment_id) => {
  return `${grist_url}/attachments/${attachment_id}/download`
}

const getRecords = async (table_id, filter = {}) => {
  const url = `${grist_url}/tables/${table_id}/records`
  const response = await axios.get(url, {
    params: { filter: JSON.stringify(filter) }
  })
  return response.data['records']
}

const getRecordsByIds = async (table_id, records_ids) => {
  return getRecords(table_id, { id: records_ids })
}

const getRecord = async (table_id, record_id) => {
  const records = await getRecordsByIds(table_id, [record_id])
  return records[0]
}

export default {
  imageUrl,
  getRecords,
  getRecordsByIds,
  getRecord
}

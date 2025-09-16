const grist_id = 'ofSVjCSAnMb6'
const grist_url = `https://grist.numerique.gouv.fr/api/docs/${grist_id}`

const imageUrl = (attachment_id) => {
  return `${grist_url}/attachments/${attachment_id}/download`
}

const getRecords = async (table_id, filters) => {
  const url = `${grist_url}/${table_id}/records`
  const response = await fetch(url, {
    method: 'GET',
    params: { filters }
  })
  return response.json()
}

export default {
  imageUrl,
  getRecords
}

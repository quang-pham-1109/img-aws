import { AWS_URL } from './constant'

export const getSignedUrls = async (files: File[]): Promise<any> => {
  const fileData = files.map((file) => ({ name: file.name, size: file.size }))

  const response = await fetch(`${AWS_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ files: fileData })
  })

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  // Parse the response data as JSON and return it
  const data = await response.json()
  return data
}

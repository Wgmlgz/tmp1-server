const useDownloadJson = (data: any, name: string) => {
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(data)
  )}`
  const link = document.createElement('a')
  link.href = jsonString
  link.download = name

  link.click()
}

export default useDownloadJson

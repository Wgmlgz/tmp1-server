import { load } from 'cheerio'
import axios from 'axios'

async function parseWbPage(link: string) {
  const html = await (await axios.get(link)).data
  const $ = load(html)

  const raw_name = $('.same-part-kt__header-wrap > .same-part-kt__header')
    .text()
    .trim()
  const name =
    raw_name
      ?.substring(0, raw_name.length / 2)
      ?.split('/')[1]
      ?.trim() || raw_name.substring(0, raw_name.length / 2)

  const raw_art = $('#productNmId').text().trim()
  const article = raw_art.substring(0, raw_art.length / 2)

  const pics: string[] = []
  $('img')
    .filter(
      // @ts-ignore
      (a, b) => !!b.attribs['alt'] && /.+Вид [1-2]./.test(b.attribs['alt'])
    )
    .each((a, b) => {
      // @ts-ignore
      pics.push(`https:${b.attribs['src']}`)
    })

  const raw_data = $('.product-params__row > .product-params__cell')
    .text()
    .trim()
    .split('\n')
    .map(s => s.trim())
  let arr: any = []
  while (raw_data.length > 0) arr.push(raw_data.splice(0, 2))
  const data_map = new Map<string, string>(arr)

  const result = {
    article,
    name,
    weight: parseInt(data_map.get('Вес товара с упаковкой (г)') ?? '0'),
    width: parseInt(data_map.get('Ширина упаковки') ?? '0'),
    height: parseInt(data_map.get('Высота упаковки') ?? '0'),
    length: parseInt(data_map.get('Глубина упаковки') ?? '0'),
    description: $('.j-description p').text().trim(),
    imgUrl: pics,
    country: data_map.get('Страна производства'),
  }
  return result
}
export default parseWbPage

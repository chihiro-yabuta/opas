import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer-core'

type Json = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Json | Buffer>
) {
  const { searchParams } = new URL(
    req.url as string,
    `http://${req.headers.host}`
  )
  const url = searchParams.get('url')

  if (!url) {
    return res
      .status(400)
      .json({ message: `A ?url query-parameter is required` })
  }

  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.token}`,
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })
  console.log(url)
  await page.goto(url)

  const pdfBuffer = Buffer.from(await page.pdf())

  return res.status(200).send(pdfBuffer)
}
import { dockStart } from '@nlpjs/basic'
import orderContext from '../contexts/order_context.json'
import informationContext from '../contexts/information_context.json'
import greetingContext from '../contexts/greeting_context.json'
import humanServiceContext from '../contexts/human_service_context.json'

// const { similarity } = require('@nlpjs/similarity')
import { similarity } from '@nlpjs/similarity'

export interface INlpResponse {
  intent: string

  score: number
  classifications: Array<{ label: string; value: number }>
}

class NlpService {
  private static instance: NlpService
  private nlp: any
  private specialWords: { [key: string]: string } = { 'order.request': 'cardapio' }

  constructor(private lang: string = 'pt') {}

  public static getInstance(): NlpService {
    if (!NlpService.instance) {
      NlpService.instance = new NlpService()
    }
    return NlpService.instance
  }

  onIntent = (_nlp, input: any) => {
    const regex = /[\s,.;:?!]+/
    // Usa a expressão regular para dividir a string
    const wordArray: string[] = input.utterance
      .split(regex)
      .filter((word: string) => word.length > 0)

    for (const word of wordArray) {
      for (const [intent, specialWord] of Object.entries(this.specialWords)) {
        const levenshtein = similarity(word, specialWord, true)
        if (
          levenshtein >= 0 &&
          levenshtein <= 3 &&
          (input.intent === 'None' || input.score < 0.9)
        ) {
          input.intent = intent
        }
      }
    }
    return input
  }

  async train(): Promise<void> {
    const dock = await dockStart({ use: ['Basic'] })
    const nlp = dock.get('nlp')
    nlp.onIntent = this.onIntent
    await nlp.addCorpus(orderContext)
    await nlp.addCorpus(informationContext)
    await nlp.addCorpus(greetingContext)
    await nlp.addCorpus(humanServiceContext)
    await nlp.train()

    this.nlp = nlp
  }

  async process(message: string): Promise<INlpResponse> {
    return await this.nlp.process(this.lang, message)
  }
}

// export default NlpService;

const nlpService: NlpService = NlpService.getInstance()
export default nlpService

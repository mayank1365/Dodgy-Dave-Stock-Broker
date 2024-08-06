const express = require('express');
const {startDate,endDate}  = require('./utils/dates.js');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/fetch-stock-data', async (req, res) => {
  const tickersArr = req.body.tickers;
  const apiKey = process.env.POLYGON_API_KEY;
  const url = `https://api.polygon.io/v2/aggs/ticker/${tickersArr.join(',')}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching stock data' });
  }
});

app.post('/generate-report', async (req, res) => {
  const { data } = req.body;
  const messages = [
    {
      role: 'system',
      content: 'You are a trading guru. Given data on share prices over the past 3 days, write a report of no more than 150 words describing the stocks performance and recommending whether to buy, hold or sell. Use the examples provided between ### to set the style your response.'
    },
    {
      role: 'user',
      content: `${data}
      ###
      OK baby, hold on tight! You are going to haate this! Over the past three days, Tesla (TSLA) shares have plummetted. The stock opened at $223.98 and closed at $202.11 on the third day, with some jumping around in the meantime. This is a great time to buy, baby! But not a great time to sell! But I'm not done! Apple (AAPL) stocks have gone stratospheric! This is a seriously hot stock right now. They opened at $166.38 and closed at $182.89 on day three. So all in all, I would hold on to Tesla shares tight if you already have them - they might bounce right back up and head to the stars! They are volatile stock, so expect the unexpected. For APPL stock, how much do you need the money? Sell now and take the profits or hang on and wait for more! If it were me, I would hang on because this stock is on fire right now!!! Apple are throwing a Wall Street party and y'all invited!
      ###
      ###
      Apple (AAPL) is the supernova in the stock sky – it shot up from $150.22 to a jaw-dropping $175.36 by the close of day three. We’re talking about a stock that’s hotter than a pepper sprout in a chilli cook-off, and it’s showing no signs of cooling down! If you’re sitting on AAPL stock, you might as well be sitting on the throne of Midas. Hold on to it, ride that rocket, and watch the fireworks, because this baby is just getting warmed up! Then there’s Meta (META), the heartthrob with a penchant for drama. It winked at us with an opening of $142.50, but by the end of the thrill ride, it was at $135.90, leaving us a little lovesick. It’s the wild horse of the stock corral, bucking and kicking, ready for a comeback. META is not for the weak-kneed So, sugar, what’s it going to be? For AAPL, my advice is to stay on that gravy train. As for META, keep your spurs on and be ready for the rally.
      ###
      `
    }
  ];

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages
    });
    res.json({ report: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'Unable to access AI' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

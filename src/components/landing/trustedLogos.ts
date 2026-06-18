import airbnbLogo from '../../assets/landing/Airbnb (logo — Colour).svg'
import googleLogo from '../../assets/landing/Google (logo — Colour).svg'
import linkedInLogo from '../../assets/landing/LinkedIn (logo — Colour).svg'
import slackLogo from '../../assets/landing/Slack (logo — Colour).svg'
import spotifyLogo from '../../assets/landing/Spotify (logo — Colour).svg'
import stripeLogo from '../../assets/landing/Stripe (logo — Colour).svg'
import twitchLogo from '../../assets/landing/Twitch (logo — Colour).svg'
import youTubeLogo from '../../assets/landing/YouTube (logo — Colour).svg'

export interface TrustedLogo {
  id: string
  name: string
  src: string
}

export const trustedLogos: TrustedLogo[] = [
  { id: 'spotify', name: 'Spotify', src: spotifyLogo },
  { id: 'slack', name: 'Slack', src: slackLogo },
  { id: 'airbnb', name: 'Airbnb', src: airbnbLogo },
  { id: 'linkedin', name: 'LinkedIn', src: linkedInLogo },
  { id: 'google', name: 'Google', src: googleLogo },
  { id: 'youtube', name: 'YouTube', src: youTubeLogo },
  { id: 'stripe', name: 'Stripe', src: stripeLogo },
  { id: 'twitch', name: 'Twitch', src: twitchLogo },
]

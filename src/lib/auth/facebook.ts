import "server-only"

export async function getPages(accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v24.0/me/accounts?access_token=${accessToken}`+
    `&fields=id,name,access_token,picture.width(512).height(512),category,tasks`
  )
  const data = await response.json()
  return data.data
}

export async function subscribePageToWebhook(pageId: string, pageAccessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v24.0/${pageId}/subscribed_apps?` +
    `access_token=${pageAccessToken}&` +
    `subscribed_fields=messages,messaging_postbacks,messaging_optins`,
    { method: 'POST' }
  )

  if (!response.ok) {
    console.error(`Failed to subscribe Page ${pageId} to webhooks`)
    console.error(response.json())
  }

  return response.json()
}

interface ParsedLink {
  text: string
  url: string
  fullMatch: string
}

interface SendMessageOptions {
  recipientId: string
  text?: string
  attachment?: {
    type: "image" | "audio" | "video" | "file"
    url: string
  }
  isOutside24HourWindow?: boolean
}

/**
 * Parse markdown links from text in format [text](url)
 * Returns array of parsed links and the text with links replaced by their text
 */
function parseMarkdownLinks(text: string): { links: ParsedLink[], cleanedText: string } {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const links: ParsedLink[] = []
  let match
  
  // Find all markdown links
  while ((match = linkRegex.exec(text)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      fullMatch: match[0]
    })
  }
  
  // Replace markdown links with just the link text (removes the URL part)
  // This way the text appears in the message and also as a button
  const cleanedText = text.replace(linkRegex, '$1')
  
  return { links, cleanedText }
}

interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendMessage(
  pageAccessToken: string,
  options: SendMessageOptions
): Promise<SendMessageResult> {
  try {
    const messagePayload: any = {
      recipient: {
        id: options.recipientId
      },
      message: {}
    }

    // Parse markdown links from text
    let messageText = options.text || ""
    let markdownLinks: ParsedLink[] = []
    
    if (messageText) {
      const parsed = parseMarkdownLinks(messageText)
      markdownLinks = parsed.links
      messageText = parsed.cleanedText.trim()
    }

    // If we have markdown links, use button template
    if (markdownLinks.length > 0) {
      // Facebook Messenger supports up to 3 buttons per message
      const buttons = markdownLinks.slice(0, 3).map(link => ({
        type: "web_url",
        url: link.url,
        title: link.text.length > 20 ? link.text.substring(0, 17) + "..." : link.text // Max 20 chars for button title
      }))

      messagePayload.message.attachment = {
        type: "template",
        payload: {
          template_type: "button",
          text: messageText || "Click the button below:",
          buttons: buttons
        }
      }
    } else {
      // No markdown links, use regular text message
      if (messageText) {
        messagePayload.message.text = messageText
      }

      // Add attachment if provided (only if no button template)
      if (options.attachment) {
        messagePayload.message.attachment = {
          type: options.attachment.type,
          payload: {
            url: options.attachment.url,
            is_reusable: true
          }
        }
      }
    }

    // Add messaging_type and tag if outside 24-hour window
    // Only add this if you know the message is outside the 24-hour window
    if (options.isOutside24HourWindow) {
      messagePayload.messaging_type = 'MESSAGE_TAG'
      messagePayload.tag = 'ACCOUNT_UPDATE'
    }

    const response = await fetch(
      `https://graph.facebook.com/v24.0/me/messages?access_token=${pageAccessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messagePayload)
      }
    )

    const result = await response.json()

    if (result.error) {
      console.error("Facebook API error:", result.error)
      return {
        success: false,
        error: result.error.message || "Failed to send message"
      }
    }

    return {
      success: true,
      messageId: result.message_id
    }
  } catch (error: any) {
    console.error("Error sending message:", error)
    return {
      success: false,
      error: error.message || "Unknown error occurred"
    }
  }
}

interface UserProfileResult {
  success: boolean
  profile?: {
    firstName: string
    lastName: string
    profilePic: string
    locale?: string
    timezone?: number
  }
  error?: string
}

export async function getUserProfile(
  pageAccessToken: string,
  userPsid: string
): Promise<UserProfileResult> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v24.0/${userPsid}?` +
      `fields=first_name,last_name,profile_pic,locale,timezone&` +
      `access_token=${pageAccessToken}`
    )

    const data = await response.json()

    if (data.error) {
      console.error("Facebook API error:", data.error)
      return {
        success: false,
        error: data.error.message || "Failed to get user profile"
      }
    }

    return {
      success: true,
      profile: {
        firstName: data.first_name,
        lastName: data.last_name,
        profilePic: data.profile_pic,
        locale: data.locale,
        timezone: data.timezone
      }
    }
  } catch (error: any) {
    console.error("Error fetching user profile:", error)
    return {
      success: false,
      error: error.message || "Unknown error occurred"
    }
  }
}
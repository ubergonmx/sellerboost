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
  }

  return response.json()
}

interface SendMessageOptions {
  recipientId: string
  text?: string
  attachment?: {
    type: "image" | "audio" | "video" | "file"
    url: string
  }
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

    // Add text if provided
    if (options.text) {
      messagePayload.message.text = options.text
    }

    // Add attachment if provided
    if (options.attachment) {
      messagePayload.message.attachment = {
        type: options.attachment.type,
        payload: {
          url: options.attachment.url,
          is_reusable: true
        }
      }
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
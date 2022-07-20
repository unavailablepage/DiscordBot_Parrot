const { Client, Intents } = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] })
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice')
const googleTTS = require('google-tts-api')

// PREFIX
const prefix = "/"

client.on("ready", ()=> {
  console.log('Logged on as ' + client.user.tag)
})

client.on("messageCreate", msg => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) { return }

  const args = msg.content.slice(prefix.length).trim().split(' ')
	const command = args.shift().toLowerCase()
  const message = args.join(" ")

  // PING
  if (command == "ping") { msg.reply("pong") }
  // PARROT
  else if (command == "parrot") { msg.reply(message) }
  /*
    The bot will join the voice channel the user is in,
    and it will speak the message the user provided.

    Example: /s Hello world!
  */
  else if (command == "s") {
    const connection = joinVoiceChannel({
            channelId: msg.member.voice.channel.id,
            guildId: msg.guild.id,
            adapterCreator: msg.guild.voiceAdapterCreator
        })
    
    // Get audio URL
    const url = googleTTS.getAudioUrl(message, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });
    //console.log(url);

    const player = createAudioPlayer();
    const resource = createAudioResource(url, { inlineVolume: true })

    connection.subscribe(player); 
    player.play(resource)
    
  }

})

client.login(process.env.TOKEN)
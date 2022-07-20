const DiscordJS = require("discord.js")
const { Client, Intents } = DiscordJS
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] })
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice')
const googleTTS = require('google-tts-api')

// PREFIX
const prefix = "?"

client.on("ready", ()=> {
  console.log('Logged on as ' + client.user.tag)

  // STATUS
  client.user.setActivity("you", { type: "WATCHING" });

  const guildID = process.env.guildID
  const guild = client.guilds.cache.get(guildID)
  let commands

  if (guild) { commands = guild.commands } 
  else { commands = client.application?.commands }

  // JOIN
  commands?.create({
    name: "join",
    description: "Bot will join the voice channel that the user is in.",
  })
  // SPEAK
  commands?.create({
    name: "speak",
    description: "The bot will announce your message within the voice channel.",
    options: [
      {
        name: "message",
        description: "The message you want announced.",
        required: true,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
      }
    ],
  })
  
})

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) { return }

  const { commandName, options } = interaction

  // JOIN
  if (commandName === "join") {
    const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })
    interaction.reply ({
      content: "Connection successful.",
      ephemeral: true,
    })
  }
  // SPEAK
  else if (commandName === "speak") {
    const message = options.getString("message")

    // Join VC
    const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })

    // Audio
    const url = googleTTS.getAudioUrl(message, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(url, { inlineVolume: true })
    connection.subscribe(player); 
    player.play(resource)
  }
  
  interaction.reply ({
      content: "Your message: " + options.getString("message"),
      ephemeral: true,
    })
})

client.on("messageCreate", msg => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) { return }

  const args = msg.content.slice(prefix.length).trim().split(' ')
	const command = args.shift().toLowerCase()
  const message = args.join(" ")

  if (command == "s") {
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
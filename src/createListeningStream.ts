// @ts-ignore
import { createWriteStream, createReadStream } from 'fs';
// @ts-ignore
import { pipeline, Transform } from 'stream';
import { EndBehaviorType, VoiceReceiver, createAudioPlayer, createAudioResource, VoiceConnection, StreamType } from '@discordjs/voice';
// @ts-ignore
import type { User } from 'discord.js';
// @ts-ignore
import * as prism from 'prism-media';

class AudioLevelMonitor extends Transform {
  private player = createAudioPlayer();
  //Loop method
  private resource = createAudioResource(createReadStream('long-shhhh.ogg'), {
    inputType: StreamType.OggOpus,
  });
  //private isCurrentlyTalking = false;
   
  constructor(private connection: VoiceConnection) {
    super();
	this.player.play(this.resource);
    this.connection.subscribe(this.player);
    this.player.pause();
	this.player.on('error', error => {
      console.error(`AudioPlayer Error: ${error}`);
    });
  }

  override _transform(chunk: Buffer, _encoding: string, callback: (error?: Error | null, data?: any) => void) {
    let isTalking = false;

    // Analyze the audio chunk and set isTalking accordingly
    for (let i = 0; i <= chunk.length - 2; i += 2) {
	  const amplitude = Math.abs(chunk.readInt16LE(i));
      if (amplitude > 500) {
        isTalking = true;
        break;
      }
    }
	
	//Memory leak method
    /*if (isTalking && !this.isCurrentlyTalking) {
	  this.isCurrentlyTalking = true;
      if (this.player.state.status !== 'playing') {
		  console.log("Talking");
		  let newResource = createAudioResource(createReadStream('shhhh.ogg'), {
				inputType: StreamType.OggOpus,
		  });
		  this.player.play(newResource);
		  this.connection.subscribe(this.player);
	  }
    } else if (!isTalking && this.isCurrentlyTalking) {
      console.log('Silence');
      this.isCurrentlyTalking = false;
	  //if (this.player.state.status !== AudioPlayerStatus.Idle) {
	  this.player.stop();
	  //}
    }*/
	
	//Loop method
	if (isTalking) {
      console.log('Talking');
      //this.isCurrentlyTalking = true;
      this.player.unpause();

    } else {
	  this.player.pause();
      console.log('Silence');
      //this.isCurrentlyTalking = false;
    }

    callback(null, chunk);
  }
}

/*function getDisplayName(userId: string, user?: User) {
  return user ? `${user.username}_${user.discriminator}` : userId;
}*/

export function createListeningStream(receiver: VoiceReceiver, userId: string, _user?: User, connection?: VoiceConnection) {
  if (!connection) return;
  const opusStream = receiver.subscribe(userId, {
    end: {
      behavior: EndBehaviorType.AfterSilence,
      duration: 1000,
    },
  });
  const audioMonitor = new AudioLevelMonitor(connection);
  
  // Error Handling
  opusStream.on('error', (err) => {
    console.error(`OpusStream Error: ${err}`);
  });
  
  opusStream.on('close', () => {
    console.log('OpusStream closed');
  });

  audioMonitor.on('error', (err) => {
    console.error(`AudioMonitor Error: ${err}`);
  });

  // Pipe the opus stream into the audio monitor
  opusStream.pipe(audioMonitor);
}
//external dependencies
var HTTPS = require('https');
var fs = require('fs');
var Redis = require('ioredis');
var redis = new Redis(process.env.REDIS_URL);

//internal dependencies
var botID = process.env.BOT_ID;
var botID_live = process.env.BOT_ID_live;
var botID_test = process.env.BOT_ID_test;
var groupID_live = process.env.GROUP_ID_live;
var groupID_test = process.env.GROUP_ID_test;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      rollCommand = /^\/roll/i,
      rollStatsCommand = /^\/rollStats/i,
      addCommand = /^\/addCommand/i,
      coolCommand = /^\/cool guy/i,
      helpCommand = /^\/help/i,
      classesCommand = /^\/classes/i,
      racesCommand = /^\/races/i,
      goblinsCommand = /^\/show me goblins/i,
      pigeonsCommand = /^\/show me pigeons/i,
      screamCommand = /^\/scream/i,
      commandsCommand = /^\/commands/i,
      generateCharacterCommand = /^\/generate character/i,
      characterCommand = /^\/character/i,
      generateNameCommand = /^\/generate name/i,
      nameCommand = /^\/name/i,
      otherCommand = /^\//;
      
  console.log("Incoming message:");
  console.log("user ID: " + request.user_id);
  console.log("group ID: " + request.group_id);
  if (request.attachments) console.log("image: " + request.attachments);
  console.log("message: " + request.text);

  if(request.text && (request.user_id!="774338" || request.user_id!="774419")) {
 
    switch(request.group_id) {
      case groupID_live:
        botID = botID_live;
        break;
      case groupID_test:
        botID = botID_test;
        break;
    }
    
    if(rollCommand.test(request.text) && !(rollStatsCommand.test(request.text))) {
      console.log("roll command called");
      this.res.writeHead(200);
      postRoll(request.text);
      this.res.end();
    }else if(rollStatsCommand.test(request.text)) {
      console.log("rolling stats");
      this.res.writeHead(200);
      postMessage(rollStats());
      this.res.end();
    }else if(coolCommand.test(request.text)) {
      console.log("cool guy has chill day!");
      this.res.writeHead(200);
      postMessage("https://youtu.be/4txVqr1eNwc");
      this.res.end();
    }else if(helpCommand.test(request.text)) {
      console.log("Help Command Called");
      this.res.writeHead(200);
      postMessage(writeHelp());
      this.res.end();
    }else if(classesCommand.test(request.text)) {
      console.log("DnD Classes Requested");
      this.res.writeHead(200);
      postMessage(writeClasses());
      this.res.end();
    }else if(racesCommand.test(request.text)) {
      console.log("DnD Races Requested");
      this.res.writeHead(200);
      postMessage(writeRaces());
      this.res.end();
      this.res.writeHead(200);
      postMessage(writeRacesB());
      this.res.end();
    }else if(goblinsCommand.test(request.text)) {
      console.log("Goblins Requested");
      this.res.writeHead(200);
      postImage("Heh heh Goblin time",goblinLink());
      this.res.end();
    }else if(pigeonsCommand.test(request.text)) {
      console.log("Pigeons Requested");
      this.res.writeHead(200);
      postImage("",pigeonLink());
      this.res.end();
    }else if(screamCommand.test(request.text)) {
      console.log("Scream Requested");
      this.res.writeHead(200);
      postMessage("AAAAAAHHHHHH!!!!!");
      this.res.end();
    }else if(addCommand.test(request.text)) {
      console.log("Adding new command");
      this.res.writeHead(200);
      if (request.user_id == "21553999"){
      	postMessage(setCommand((request.text).substring(12)));
      }
      this.res.end();
    }else if(commandsCommand.test(request.text)) {
      console.log("list of commands requested");
      this.res.writeHead(200);
      writeCommands();
      this.res.end();
    }else if(generateCharacterCommand.test(request.text) || characterCommand.test(request.text)) {
      console.log("generating random character");
      this.res.writeHead(200);
      postMessage(generateCharacter());
      this.res.end();
    }else if(generateNameCommand.test(request.text) || nameCommand.test(request.text)) {
      console.log("generating random name");
      this.res.writeHead(200);
      postMessage(generateName());
      this.res.end();
    }else if(otherCommand.test(request.text)) {
      console.log("Requesting Other Command");
      this.res.writeHead(200);
      redis.get(request.text).then(function (result) {
        if (result === null) {
          console.error("Command Not Found");
          postMessage("Error: Command Not Found");
        }else{
          console.log(result);
          postMessage(result);
        }
      });
      this.res.end();
    }else {
      console.log("don't care");
      this.res.writeHead(200);
      this.res.end();
    }
  }
}

function postRoll(input) {
  var botResponse, dice;
  
  if (input == "/roll") {
    var helpText = "Roll Commands:";
    helpText+= "\n    /roll dX: roll X-sided die";
    helpText+= "\n    /roll NdX: roll N X-sided dice";
    helpText+= "\n    /roll NdX + K: roll N X-sided dice, and add K";
    helpText+= "\n    /roll NdX + K + dY: roll N X-sided dice, add K, and roll one Y-sided die";
    postMessage(helpText);
    return 0
  }

  try {
    dice = /(\d*)?d(\d+)((?:[+-](?:\d+|\([A-Z]*\)))*)(?:\+d(\d+))?/i.exec(input);
    //dice = /(\d+)?d(\d+)([+-]\d+)?$/.exec(input);
  }
  catch (e) {
    // do nothing
  }

  var rollStr = String(dice[0]);
  var howMany = (typeof dice[1] == 'undefined') ? 1 : parseInt(dice[1]);
  var dieSize = parseInt(dice[2]);
  var modifier = (typeof dice[3] == 'undefined') ? 0 : parseInt(dice[3]);
  var secondDieSize = parseInt(dice[4]);

  botResponse = roll(rollStr, howMany, dieSize, modifier, secondDieSize);
  postMessage(botResponse);
}

function writeHelp() {
  var helpText = "This is Piss Goblin, the best D&D bot ever created by Luke!";
  helpText+= "\n\n Roll Commands:";
  helpText+= "\n    /roll dX: roll X-sided die";
  helpText+= "\n    /roll NdX: roll N X-sided dice";
  helpText+= "\n    /roll NdX + K: roll N X-sided dice, and add K";
  helpText+= "\n    /roll NdX + K + dY: roll N X-sided dice, add K, and roll one Y-sided die";
  helpText+= "\n\n Other Commands:";
  helpText+= "\n    /help: see list of commands (you just used it you absolute fool)";
  helpText+= "\n    /classes: view a list of D&D classes";
  helpText+= "\n    /races: view a list of D&D races";
  helpText+= "\n    /rollStats: roll stats for new D&D character";
  helpText+= "\n    /generate character: generate a random D&D character";
  helpText+= "\n    /show me goblins: see for yourself";
  helpText+= "\n    /show me pigeons: you saw that right";
  helpText+= "\n    /addCommand /command|message: Create a new command that displays a message";
  helpText+= "\n    /commands: see a list of commands created by /addCommand. These can sometimes be deleted when the app updates";
  helpText+= "\n\n For a full list of commands and more info, visit goblin.luke.computer";
  return helpText;
}

function writeClasses() {
  var helpText = "Classes:";
  helpText+= "\n\n Barbarian - Physical fighter who relies on rage and emotion to fight";
  helpText+= "\n Bard - Magical musician who can support/heal/buff people";
  helpText+= "\n Cleric - Holy priest with divine powers, acting as an intermediary to their deity";
  helpText+= "\n Druid - Person of nature with elemental powers and the ability to transform";
  helpText+= "\n Fighter - Combat specialist who shines most in fights, and can specialize in different forms of combat";
  helpText+= "\n Monk - Martial artist who harnesses magical energy";
  helpText+= "\n Paladin - A blessed knight sworn to fight the forces of evil - Hazel/Creed";
  helpText+= "\n Ranger - Hunter and tracker, familiar with the wilds and the forces of nature";
  helpText+= "\n Rogue - Sneaky thief, specializing in the arts of deception and trickery";
  helpText+= "\n Sorcerer - Born with innate and mysterious magical powers - Mav/Bread";
  helpText+= "\n Warlock - Granted powers from a powerful being";
  helpText+= "\n Wizard - Student of the arcane arts, relying on their knowledge to cast spells";
  return helpText;
}

function writeRaces() {
  var helpText = "Races:";
  helpText+= "\n\n Dwarf - A bold and hardy people who make skilled warriors and miners. They are short, compact, and broad.";
  helpText+= "\n Elf - A magical people of otherworldly grace. Slightly shorter than humans, and very slender.";
  helpText+= "\n Halfling - A kindhearted people who love peace, food, hearth, and home. About 3 feet tall and 40-45 pounds. AKA Hobbits";
  helpText+= "\n Human - Among the youngest of races, living shorter lives. All-around skilled. You've met some IRL.";
  helpText+= "\n Dragonborn - Born of the dragons, living in a world that fears them. Though humanoid in form, they have fine scales of various colors.";
  helpText+= "\n Gnome - A small people with an enthusiasm for life. Similar in size to halflings";
  helpText+= "\n Half-Elf - A person who is half-human, half-elf, and shares some traits from each.";
  return helpText;
}

function writeRacesB() {
  var helpText= "\n Half-Orc - Born of human and orcish parents, these people struggle to find their place in the world. About 6-7 feet tall, and weighing more than humans.";
  helpText+= "\n Tiefling - Poorly mistreated and mistrusted, a people who were cursed with large horns, thick tails, and skin in shades of purple.";
  helpText+= "\n Aarakocra - Dwelling in the mountains, a people with a bird-like appearance, with large wings and feathered bodies.";
  helpText+= "\n Goblin - A small, monstrous humanoid with broad noses, pointed ears, and sharp fangs.";
  helpText+= "\n\nThere are many other races in DnD too! These are just the default ones and ones we've discussed.\nIf you have questions, just ask!";
  return helpText;
}

function generateCharacter() {
  var charText = "";
  var races = ['dwarf', 'elf', 'halfling', 'human', 'dragonborn', 'gnome', 'half-elf', 'half-orc', 'tiefling'];
  var randomRace = races[Math.floor(Math.random() * races.length)];
  var classes = ['barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'];
  var randomClass = classes[Math.floor(Math.random() * classes.length)];
  var backgrounds = ['acolyte', 'charlatan', 'criminal', 'entertainer', 'folk hero', 'gladiator', 'guild artisan', 'guild merchant', 'hermit', 'knight', 'noble', 'outlander', 'pirate', 'sage', 'sailor', 'soldier', 'spy', 'urchin'];
  var randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  var name = generateName();
  charText = "You are a " + randomRace + " " + randomClass + " with the " + randomBackground + " background named " + name + ".";
  return charText;
}

function generateName() {
  var beg = ["Bor","Sne","Bel","Gor","Brog","Creg","Ort","Bul","Grul","Grol","Snu","Plu","Gre","Fish","Lu","Chub"];
  var mid = ["bort","bert","port","pert","gerb","grob","snorg","to","ton","bus","po","glert","borb","snert","","",""];
  var end = ["po","us","tum","elbus","olaf","greb","snib","oolus"," the Third","ke","","",""];
  var name = beg[Math.floor(Math.random() * beg.length)]; // first third of name
  name += mid[Math.floor(Math.random() * mid.length)]; // second third of name
  name+= end[Math.floor(Math.random() * end.length)]; // last third of name
  return name;
}

function setCommand(input) {
  var i;
  var retStr = "";
  commandSet = input.split("|");
  if (commandSet.length!=2 || !(/^\//.test(commandSet[0]))) {
    console.log("Error: Improper Formatting");
    return "Error: Improper Formatting";
  }
  redis.get(commandSet[0]).then(function (result) {
    if (result != null) {
      console.log("Error: Tried to Create an Existing Command");
      return "Error: Tried to Create an Existing Command";
    }
  });
  if (redis.set(commandSet[0],commandSet[1])) {
    console.log("Creating new command");
    redis.rpush(['commands', commandSet[0] + " : " + commandSet[1]], function(err, reply) {
      console.log(reply); //prints 2
    });
    return "New Command Created!\n"+commandSet[0]+" : "+commandSet[1];
  }
  
  return "Error: Command Not Created - Contact Luke for more info";
}

function writeCommands() {
  redis.lrange('commands', 0, -1, function(err, reply) {
    if (err) {
      console.log("Error");
    } else if (reply.length == 0) {
      console.log("List empty");
      postMessage("No commands created yet.");
    } else {
      var retStr = "List of custom commands:";
      for (var i = 0, len = reply.length; i < len; i++) {
        retStr += "\n"+reply[i];
      }
      if (retStr == "") retStr = "No commands created yet."
      console.log(retStr);
      postMessage(retStr);
    }
  });
  return 0;
}

function goblinLink() {
  var images = ["https://i.groupme.com/516x389.jpeg.f6f5ba888c9d4a3da2e4dba9242ded85",
    "https://i.groupme.com/907x1000.jpeg.795681884d1f4ba88ca73243fd9ce9e0",
    "https://i.groupme.com/999x488.jpeg.849423c6e4bb4055b9922c367a18e6f0",
    "https://i.groupme.com/500x500.png.7ab07f2081b6433fbf80a6d9eb30c0b5",
    "https://i.groupme.com/864x1080.jpeg.f7cb7eabdfd347a3a51777e7bb1f09f8"];
  var i = Math.floor(Math.random() * images.length)
  return images[i];
}

function pigeonLink() {
  var images = ["https://i.groupme.com/1100x619.jpeg.5524672eae2d4eb188591830f1d56dd0",
    "https://i.groupme.com/750x563.jpeg.f2e2dc78058740dfaa55ae3d6bab5f62",
    "https://i.groupme.com/1200x630.jpeg.83c44bad94884613bd08f7513ade6137",
    "https://i.groupme.com/620x413.jpeg.beedbe354a8b47b5befd2b417887acb7",
    "https://i.groupme.com/220x279.png.847062907f9c4319a4e361f4fe288017",
    "https://i.groupme.com/480x360.jpeg.48f45bb126954ee599d10c9d880e7c38",
    "https://i.groupme.com/2000x1249.jpeg.42f32a146f2d42bab5b609f027ad5c4c",
    "https://i.groupme.com/300x300.jpeg.bd03b470e5ae4870b6aef8cd0e197961"];
  var i = Math.floor(Math.random() * images.length)
  return images[i];
}

function postMessage(botResponse) {
  var botResponse, options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

function postImage(botResponse, imageURL) {
  var botResponse, options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse,
    "attachments" : [
      {
        "type"  : "image",
        "url"   : imageURL
      }
    ]


  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

function roll(rollStr, howMany, dieSize, modifier, secondDieSize) {
  var response = "Rolling "+rollStr+"...\n", i, rollResult, total = 0;
  for (i = 0; i < howMany; i++) {
    if (i > 0) response+="+";
    rollResult = Math.floor(Math.random() * dieSize) + 1;
    response+=" ("+rollResult+") ";
    total+=rollResult;
  }
  if (modifier) {
    if (modifier>0) response+="+";
    else response+="-";
    response+=" "+Math.abs(modifier)+" ";
    total+=modifier;
  }
  if (secondDieSize) {
    rollResult = Math.floor(Math.random() * secondDieSize) + 1;
    response+="+ ("+rollResult+") ";
    total+=rollResult;
  }
  return response+"\n  = "+total;//.substring;(0, response.length - 1);
}

function rollStats() {
  // roll 4 d6 and take 3 highest. Repeat 6 times
  var response = "Rolling Ability Scores (4 d6, taking 3 highest): ", i, rolls = [0,0,0,0], results = [0,0,0,0,0,0];
  for (i = 0; i < 6; i++) {
    rolls[0] = Math.ceil(Math.random() * 6);
    rolls[1] = Math.ceil(Math.random() * 6);
    rolls[2] = Math.ceil(Math.random() * 6);
    rolls[3] = Math.ceil(Math.random() * 6);
    rolls.sort();
    rolls.reverse();
    results[i] = (rolls[0]+rolls[1]+rolls[2]);
    response += "\n   (" + rolls[0] + ") + (" + rolls[1] + ") + (" + rolls[2] + ") = " + results[i];
  }
  results.sort(function(a,b){ // to sort array correctly
    return a - b;
  });
  results.reverse()
  response += "\n\n Result: " + results;
  console.log(response);
  return response;
}


exports.respond = respond;

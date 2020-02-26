import { Component, OnInit } from '@angular/core';
import { Chat } from '../model/chat.model';
import { Input } from '../model/input.model';
import { ChatService } from '../services/chat.service';
import { Router } from '@angular/router';
import { Utterence } from '../model/utterence.model';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {

  user_dp:string;

  userInput:string;

  input:Input;
  
  WatsonRes: any;

  texttospeechToken: any;
  audioWatson: any;
  WatsonResToneAnalyser: any;
  WatsonResDiscovery: any;
  WatsonResNLU: any;

  public currentIntent = "";

  data:Chat[];
  //utterances:Utterence[];


  addItem(value:string){
    this.data.push({ type: "question", text: this.userInput, options: [], feedback: false });
    //this.utterances.push({user:"customer", text: this.userInput})
    this.chatService.pushUtterences({user:"customer", text: this.userInput})
    this.input.question = this.userInput.trim();
    console.log(this.input);
    this.userInput=null;
    
    if (this.input.session_id && this.input.question != ""){
      this.chatService.sendChat(this.input).subscribe(response => {
        this.WatsonRes = response;
        
        this.WatsonRes = this.WatsonRes.result;
        console.log("response ", this.WatsonRes);


        if (this.WatsonRes.output.intents !== undefined && this.WatsonRes.output.intents.length > 0) {
          //this.CurrentIntent = ((this.WatsonRes.output.intents).sort((a, b) => a > b ? 1 : -1))[0].intent;
          this.currentIntent = this.WatsonRes.output.intents[0].intent;
          console.log("Intent found");
        }
        else
          this.currentIntent = "NA";


        // check if to call discovery service.
        console.log("main skill user defined : ");
        for (var i = 0; i < this.WatsonRes.output.generic.length; i++){
          if (this.WatsonRes.output.generic[i].response_type == 'text'){
            this.data.push({ type: "answer", text: String(this.WatsonRes.output.generic[i].text), options: [], feedback: true });
            //this.utterances.push({user:"agent", text:String(this.WatsonRes.output.generic[i].text)})
            this.chatService.pushUtterences({user:"agent", text:String(this.WatsonRes.output.generic[i].text)});
          }
        }
      })
    }
    console.log(this.data);
  }

  constructor(private chatService:ChatService, private router:Router) {
    this.user_dp='assets/images/user.jpg';
    this.input = { session_id: "", userID: 0,  assistant_id: "", question: "" };
    this.input.assistant_id='b4e71061-5863-485b-ab88-bf0358627cfa';
    this.chatService.createSession(this.input).subscribe(response=>{
        this.WatsonRes = response;
        this.data = [];
        //this.utterances=[];
        //console.log(this.WatsonRes)
  // This is for first question
        this.data.push({ type: "answer", text: "Hey, How can I help you", options: [], feedback: false });
        //this.utterances.push({user:"agent", text:"Hey, How can I help you"})
        this.chatService.pushUtterences({user:"agent", text:"Hey, How can I help you"});
        this.input.session_id = this.WatsonRes.result.session_id;
        console.log("Session ID:",this.input.session_id)
        this.input.userID = Math.floor(Math.random() * 50);
    })
   }

  ngOnInit() {
  }

  

  logout(){
    localStorage.removeItem('user');
    this.router.navigate(['/login'])

  }

}

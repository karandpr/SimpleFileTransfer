import { Component, OnInit } from "@angular/core";
import { UserDetailsService } from "../services/userdetails.service";
import { Mediafilepicker, FilePickerOptions} from 'nativescript-mediafilepicker';
import { isIOS } from "platform";
import { UploadService } from "../services/upload.service";
import { LocalFileService } from "../services/localfiles.service";
import { Page } from 'ui/page'



@Component({
    selector: "ns-items",
    moduleId: module.id,
    styleUrls: ["./details.component.css"],
    templateUrl: "./details.component.html",
})
export class DetailsComponent implements OnInit {
    
    data: any ={};
    remainingSpace: number;
    occupiedSpace: number;
    storageLimit: number;
    
    constructor(private detailsSrv: UserDetailsService,  public uploadServ: UploadService, private fileSrv: LocalFileService, private page: Page) { 
        this.page.on("navigatedTo", () => {
            this.getUserDetails();
           });

        
    }

    ngOnInit(): void {

        this.getUserDetails();
          
    }
    
    upload(){
        
        let extensions = [];
       

        if (isIOS) {
            extensions = [kUTTypePDF, kUTTypeText]; 
        } else {
            extensions = ["xlsx", "xls", "doc", "docx", "ppt", "pptx", "pdf", "txt", "png"];
        }
        
        let options: FilePickerOptions = {
            android: {
                extensions: extensions,
                maxNumberFiles: 1
            },
            ios: {
                extensions: extensions,
                multipleSelection: false
            }
        };

        let mediafilepicker = new Mediafilepicker(); 
        mediafilepicker.openFilePicker(options);

        mediafilepicker.on("getFiles",  (res) => {
            let results = res.object.get('results');
            console.dir(results);            
            console.dir(results[0].file);           
            if(this.fileSrv.getFileSize(results[0].file) < this.remainingSpace ){
                this.uploadServ.upload(results[0].file).then(res => {
                    alert('File Uploaded');
                    this.getUserDetails();        
                }).catch(err => {
                    alert(err);
                })
            } else {
                alert('Limit Exceeded');
            }
            

        });       
        
        mediafilepicker.on("error",  (res) => {
            let msg = res.object.get('msg');
            console.log(msg);
        });
        
        mediafilepicker.on("cancel",  (res) => {
            let msg = res.object.get('msg');
            console.log(msg);
        }); 
       

    }
    getUserDetails(){
        this.detailsSrv.getDetails().then(res => {
            this.remainingSpace = <number>res["remainingSpace"];
            this.occupiedSpace = <number>res["occupiedSpace"];
            this.storageLimit = <number>res["storageLimit"];
           
            this.data = {
                "storageLimit": 'Storage Limit: ' + (this.storageLimit/1048576).toFixed(2) + ' MB',
                "occupiedSpace": 'Occupied Space: ' + (this.occupiedSpace/1048576).toFixed(2) + ' MB',
                "remainingSpace": 'Remaining Space: ' + (this.storageLimit/1048576).toFixed(2) + 'MB',
            }
        }).catch(err => {

        });
    }


    
}
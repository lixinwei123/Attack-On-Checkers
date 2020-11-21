import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { JoinPrivateComponent } from './join-private.component';

@NgModule({
    imports: [CommonModule, IonicModule, FormsModule],
    declarations: [JoinPrivateComponent],
    entryComponents: [JoinPrivateComponent],
    exports: [JoinPrivateComponent]
})
export class JoinPrivateComponentModule { }

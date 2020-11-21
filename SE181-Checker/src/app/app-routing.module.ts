import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'join-game',
    loadChildren: () => import('./join-game/join-game.module').then(m => m.JoinGamePageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'game-board',
<<<<<<< HEAD
    loadChildren: () => import('./game-board/game-board.module').then(m => m.GameBoardPageModule)
=======
    loadChildren: () => import('./game-board/game-board.module').then( m => m.GameBoardPageModule)
>>>>>>> 168f68b517255664a61b704543d413bafe98f00b
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

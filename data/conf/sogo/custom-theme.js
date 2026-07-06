/* Teclat — tema estilo Gmail para o SOGo (AngularJS Material)
 *
 * Paleta baseada no Gmail:
 *   - Azul primário:   #1a73e8 (botões, seleção, links)
 *   - Fundo geral:     #f6f8fc
 *   - Seleção sidebar: #d3e3fd
 *
 * Este arquivo é montado como js/theme.js (ver docker-compose.yml) e é
 * complementado pelo custom-gmail.css (overrides estruturais), injetado
 * pelo custom-sogo.js.
 */
(function() {
  'use strict';
  angular.module('SOGo.Common')
    .config(configure);

  configure.$inject = ['$mdThemingProvider'];
  function configure($mdThemingProvider) {
    // Azul Gmail
    var gmailBlue = $mdThemingProvider.extendPalette('blue', {
      '300': '8AB4F8',
      '500': '1A73E8',
      '600': '1A73E8',
      '700': '1967D2',
      '800': '185ABC',
      'A200': '1A73E8',
      'A700': '174EA6',
      'contrastDefaultColor': 'light'
    });

    // Cinzas/brancos do Gmail (toolbars claras, fundo #f6f8fc)
    var gmailGrey = $mdThemingProvider.extendPalette('grey', {
      '50': 'FFFFFF',
      '100': 'F6F8FC',
      '200': 'F2F6FC',
      '300': 'E8EAED',
      '400': 'DADCE0',
      '500': '5F6368',
      '600': 'FFFFFF',   // toolbar da sidebar → branca
      '800': '202124',
      'A100': 'FFFFFF',
      'contrastDefaultColor': 'dark'
    });

    $mdThemingProvider.definePalette('gmail-blue', gmailBlue);
    $mdThemingProvider.definePalette('gmail-grey', gmailGrey);

    $mdThemingProvider.theme('default')
      .primaryPalette('gmail-grey', {
        'default': '50',   // toolbars principais → brancas
        'hue-1': '100',
        'hue-2': '600',    // toolbar da sidebar
        'hue-3': '300'
      })
      .accentPalette('gmail-blue', {
        'default': '600',  // FAB (Escrever) e destaques
        'hue-1': '300',
        'hue-2': '300',    // item selecionado na lista / dia atual
        'hue-3': 'A700'
      })
      .backgroundPalette('gmail-grey', {
        'default': '50',
        'hue-1': '100',
        'hue-2': '200',
        'hue-3': '300'
      });
    $mdThemingProvider.generateThemesOnDemand(false);
  }
})();

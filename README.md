# billed
ce projet confie la tâche de débugger et tester une application. (tests unitaires et d'intégration en JavaScript et tests end-to-end manuels)

## mission principale 
corriger les bugs d’un système RH et finaliser les tests. 

### étapes de réalisation
>- installer le back-end et le front-end depuis des repos spécifiques
>- déboguer certaines parties de l’application
>- rédiger et implémenter des tests unitaires en JavaScript pour vérifier la validité et la fiabilité des différentes composantes de l'application
>- élaborer un plan de test end-to-end manuel pour assurer le bon fonctionnement du parcours employé de l'application
>- écrire des tests d'intégration en JavaScript pour vérifier l'interaction entre les différentes parties de l'application
>
>Chrome Debugger sera utilisé pour le débogage de l'application, permettant ainsi de détecter et de résoudre les problèmes de manière efficace

## back-end : API Billed-app-FR-Back
installation dépendances : `$ npm install` 

lancement API : `$ npm run run:dev`

accès : [http://localhost:5678](http://localhost:5678)

## front-end : app Billed-app-FR-Front
>après avoir lancer le back-end

installation package npm : `$ npm install`

installation live-server pour lancer le serveur local : `$ npm install -g live-server`

lancement application : `$ live-server`

accès : [http://127.0.0.1:8080/](http://127.0.0.1:8080/)


## accès application
#### administrateur : 
```bash
utilisateur : admin@test.tld 
mot de passe : admin
```
#### employé : 

```bash
utilisateur : employee@test.tld
mot de passe : employee
```
## tests
#### lancer tous les tests en local avec Jest : 
```bash
$ npm run test
```

#### lancer un seul test : 
installer jest-cli :
```bash
$ npm i -g jest-cli
```
lancer le test :
```bash
$ jest src/__tests__/your_test_file.js
```

#### accès couverture de test :
[http://127.0.0.1:8080/coverage/lcov-report/](http://127.0.0.1:8080/coverage/lcov-report/)

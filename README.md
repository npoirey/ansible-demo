# ansible-demo

## Récapitulatif des commandes du TP

### initialiser le systeme : 
    # dans powershell lancé en mode admin
    docker-compose up -d
    
Cette commande créé 6 containers docker :
- un container `ansible`, avec ansible d'installé. La majorité des commandes exécutée le seront sur ce container.
- 5 containers `alpine[1-5]`, des machines barebone (distribution linux alpine) représentant notre environnement de démo

L'objectif de l'exercice est de configurer cet environnement, depuis `ansible`, afin d'installer :
- 2 machines "front" distribuant une application anguilar
- 2 machines "back" mettant a disposition une API REST utilisée par angular
- 1 machine servant de Load Balancer

Pour réinitialiser tout, vous pouvez utiliser la commande

    docker-compose down
    docker-compose up -d

### connection sur le container avec ansible d'installé:
    docker exec -it ansible /bin/sh
    
### ping via ansible
    # ping des machines du groupe web
    ansible -i inventories/demo.ini -m ping web
    # ping de toutes les machines de l'inventaire
    ansible -i inventories/demo.ini -m ping all
    
### lancement d'un playbook en checkmode
    ansible-playbook -i inventories/demo.ini --check playbook-install-base-tools.yml

### lancement du playbook pour de vrai
    ansible-playbook -i inventories/demo.ini playbook-install-base-tools.yml
    
### commandes diverses
Pour se connecter sur un des containers:

    docker exec -it alpine2 /bin/sh

Pour faire un curl

    curl alpine2:80
    
Pour vérifier si nginx est lancé :

    rc-service nginx status

Rejouer un playbook, mais uniquement sur quelques hosts :

    ansible-playbook -i inventories/demo.ini playbook-heroes-install.yml -l lb
    
## Exercices
### exercice 1
Ecrire un inventaire dans `ansible-files/inventories` appellé `demo.ini`  
Décrire l'environnement de démo comme suit :
- un alias `lb` pour le container `alpine1`
- des alias `web1` et `web2` pour les container `alpine2` et `alpine3`
- des alias `app1` et `app2` pour les container `alpine4` et `alpine5`
- un groupe `web` pour `web1` et `web2`
- un groupe `app` pour `app1` et `app2`
- un groupe `demo` contenant `lb`, `web` et `app`

Depuis le container `ansible`, faire un ping

    # ping de toutes les machines de l'inventaire
    ansible -i inventories/demo.ini -m ping all
    
Que se passe il ?

il faut ajouter `ansible_connection=docker` derrière les hôtes pour spécifier le mode de connexion

Corriger le problème et réessayer le ping

###exercice 2
- Dans le dossier ``ansible-files``, créer un playbook `playbook-install-base-tools.yml`
- modifier le playbook pour installer curl sur toutes les machines de l'inventaire
    - astuce: chercher "ansible module apk" sur google pour voir comment installer des package
- modifier le playbook pour installer nginx sur ``lb`` et `web` et s'assurer qu'il est démarré
    - astuce: utiliser le module "service"
- executer le playbook en "checkmode" ``ansible-playbook -i inventories/demo.ini --check playbook-install-base-tools.yml``
- executer réelement le playbook ``ansible-playbook -i inventories/demo.ini playbook-install-base-tools.yml``
- se connecter sur ``alpine1`` vérifier que curl est installé et nginx démarré

    
    curl alpine2:80
    rc-service nginx status
    
### exercice 3
Créer un role nginx_server dans ansible-files/roles
Ajouter un fichier tasks/main.yml et y déclarer des taches pour :
- installer nginx
- désactiver la configuration par défaut (suppression du fichier /etc/nginx/conf.d/default.conf)
- démarrer nginx

Créer un playbook playbook-heroes-install.yml et appliquer le role nginx_serveur sur les groupes lb et web

Bonus : sauvegarder la conf par défaut au lieu de la supprimer (en la renommant en default.conf.inactive par exemple)

###exercice 4
modifier le role nginx_server :
- utiliser une variable dans le rôle pour le dossier contenant la configuation nginx (et l'utiliser dans le name)
- retester le lancement du playbook
- déplacer la déclaration de la variable pour la placer dans un fichier `ansible-files/group_vars/demo.yml`
- ajouter une variable d'inventaite `app_name` pour spécifier le nom de l'application globalement

###exercice 5
Completer le rôle frontend
- dans templates/, creer un fichier nginx.conf.j2 pour servir les fichiers du front sur le port 80 (et utiliser des variables):

```
server {
    listen <port> default_server;

    root /www/data/<nom de l'application>;

    location / {
      try_files $uri $uri/ /index.html;
    }
}
```

- dans tasks/main.yml
    - utiliser le module "copy" pour copier le contenu de files/ dans un dossier /www/data/<app_name>
    - utiliser le module "template" pour placer le résultat de votre template dans le dossier /etc/nginx/conf.d/<APP_NAME>.conf
    - redémarrer nginx
    
- ajouter le role "frontend" dans le playbook, a jouer sur web en plus du role nginx existant
- exécutez le playbook et vérifiez le résultat avec un curl sur la machine web1


    curl apline2:80/index.html
    
### exercice 6
- Créer un rôle "load_balancer" dont le l'objectif est d'utiliser un template pour remplacer la conf nginx par la suivante, puis de redémarrer nginx


````
    upstream {{app_name}}_frontend {
        {% for item in groups['web'] %}
        server {{item}};
        {% endfor %}
    }

    upstream {{app_name}}_backend {
        {% for item in groups['app'] %}
        server {{item}};
        {% endfor %}
    }

    server {
        listen {{nginx_port}};

        location / {
            proxy_pass http://{{app_name}}_frontend;
        }

        location /app {
            proxy_pass http://{{app_name}}_backend;
        }
    }

````
- observer la structure du template et l'utilisation de boucles
- ajouter le role dans le playbook (à jouer sur lb)
- executer le playbook et tester avec votre navigateur internet (docker-compose a mappé le port 8080 de votre machine sur le port 80 du container)

    localhost:8080/index.html

### exercice 7
- Ajouter le rôle "backend" déjà présent dans le playbook en l'appliquant sur les machines du groupe `app`
- Executer le playbook et vérifier avec le navigateur que l'application fonctionne correctement
- Observer le contenu du rôle backend pour voir des exemples simples d'utilisation de fonctionnalité plus avancées

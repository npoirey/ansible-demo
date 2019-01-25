import {Hero, HeroData} from "../data/hero.data";



export class HeroModel {
    public static getHeroes(): Hero[] {
        return HeroData;
    }

    public static getHero(id): Hero {
        let hero: Hero[] = HeroData.filter((h) => h.id === parseInt(id));

        if(hero.length > 0) {
            return hero[0];
        } else {
            return null;
        }
    }

    private static getIndexById(id): number {
        let heroIndex = -1;
        let heroId = parseInt(id);

        HeroData.filter((h, i) => {
            if(h.id === heroId) {
                heroIndex = i;
                return true;
            }

            return false;
        });

        return heroIndex;
    }

    public static update(id, name): Hero {
        let heroIndex = this.getIndexById(id);

        if(heroIndex !== -1) {
            HeroData[heroIndex].name = name;
            return HeroData[heroIndex];
        } else {
            return null;
        }
    }

    public static create(name): Hero {
        let hero = {
            id: HeroData[HeroData.length - 1].id + 1,
            name:  name
        };

        HeroData.push(hero);

        return hero;
    }

    public static delete(id): Hero {
        let heroIndex = this.getIndexById(id);

        if(heroIndex !== -1) {
            let hero = HeroData[heroIndex];

            HeroData.splice(heroIndex, 1);
            return hero; 
        } else {
            return null;
        }
    }
}
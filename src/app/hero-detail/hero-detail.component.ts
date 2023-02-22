import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Hero } from '../hero';
import { HeroService } from '../hero.service';
import { AbstractControl, FormGroup, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';
@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: [ './hero-detail.component.css' ]
})
export class HeroDetailComponent implements OnInit {
  hero!: Hero;

  heroes!: Hero[];

  heroForm = new FormGroup({
    heroName: new FormControl('', [ 
      this._validateUniqueHeroName().bind(this),
    ]),
    age: new FormControl('', [
      Validators.required
    ]),
    description: new FormControl('', [
      this._validateDescription().bind(this),
    ]),
    email: new FormControl('', Validators.email),
    enemy: new FormControl('')
  });

  constructor(
    private route: ActivatedRoute,
    private heroService: HeroService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getHero();
    this.getHeroes();
  }

  getHeroes(): Hero[] {
    this.heroService.getHeroes().subscribe(value => {
      this.heroes = value;
      return value;
    });
    return [];
  }

  _validateUniqueHeroName(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return null;
      }
      let isUnique = !this.heroes.some(hero => hero.name?.toLowerCase() === control.value.toLowerCase());
      return isUnique ? null : { uniqueHeroName: false };
    }
  }

  _validateDescription(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return null;
      }
      const heroName = this.hero ? this.hero.name : '';
      const age = this.heroForm.get('age')?.value;
      if (age === '' || age === null) return { ageRequiredForDescription: true }
      const regex = new RegExp('^((?!' + heroName + '|' + age + ').)*$');
      const valid = regex.test(control.value);
      return valid ? null :  { validDescription: false};
    }
  }

  getHero(): void {
    const id = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
    this.heroService.getHero(id)
      .subscribe(hero => this.hero = hero);
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    let hero: Hero = {
      id: this.hero.id,
      name: this.heroForm.get('heroName')?.value,
      age: this.heroForm.get('age')?.getRawValue(),
      description: this.heroForm.get('description')?.value,
      email: this.heroForm.get('email')?.value,
      enemy: this.heroForm.get('enemy')?.value
    };

    if (hero) {
      this.heroService.updateHero(hero)
        .subscribe(() => this.goBack());
    }
  }
}

# RDI - Reflective Dependecy Injector
A port of Angular's ReflectiveInjector. Originally made for DiscordBuddy

## About
RDI is a IoC container for TypeScript apps. It's heavily inspired by Angular's own DI, and because of that I have choosen to keep the exact same API as Angular's DI.

## Motivation
I have aways been a huge fan of Angular's way of strucuring an application. 
RDI was originally written for DiscordBuddy, a framework to build amazing Discord bots with. However I noticed I started using the di part of DiscordBuddy in other projects too. So I thought might as well make a separated NPM module which can be better documented.

## Installation
You can get the latest version of RDI and it's definitions with npm like so:
```bash
$ npm install rdi reflect-metadata --save
```
RDI required Reflect Metadata in order to work correctly and you should import `reflect-metadata` only once in your entire application.

## Usage

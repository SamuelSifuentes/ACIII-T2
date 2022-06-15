# Simulador de um pipeline superescalar com algoritmo de tomasulo
Trabalho final de arquitetura III

## Membros da equipe
* Guilherme Cosso
* Israel Péres
* Samuel Sifuentes

## Instruções implementadas
* MIPS - ADD, ADDI, SW, LW, MUL, DIV
* Descarte e desvio - BEQ
* Instruções possuem 3 estágios, DECODE, EXECUTE e WRITE-BACK

## Componentes implementados
* Pipeline superescalar com IF - OF - EX -  MEM - WB
* Janela de reserva distribuida para cada unidade funcional
* Buffer de reordenamento

## Como rodar o projeto
1. Instalar o nodejs e o npm
2. Executar <code>npm i</code>
3. Executar <code>npm i -g</code>
4. Instalar o angular-cli (<code>npm i -g @angular/cli</code>)
7. Clonar esse repositório e entrar na pasta app
6. Executar <code>ng serve</code>
7. Abrir url http://localhost:4200/ no browser
8. Inserir as intruções pelo menu "Inserir Instruções"
9. Executar pelo botão "EXECUTAR"

## Tecnologias usadas
* Angular
* Typescript
* HTML

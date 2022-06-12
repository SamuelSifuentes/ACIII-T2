import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
@Component({
  selector: 'app-tela',
  templateUrl: './tela.component.html',
  styleUrls: ['./tela.component.css']
})
export class TelaComponent implements OnInit {
  memoria;
  registradorClass;
  comandos

  Instrucoes: Instrucao[];

  InstrucaoForm: FormGroup
  entradas = 0;

  constructor(public formBuilde: FormBuilder) { }


  ngOnInit(): void {
    this.memoria = Memoria
    this.registradorClass = Registrador;
    this.comandos = comando;
    this.Instrucoes = Instrucao.getLista();
    this.InstrucaoForm = this.formBuilde.group({
      Instrucao: this.formBuilde.control('', { validators: [Validators.required] }),
      dest: this.formBuilde.control('', { validators: [Validators.required] }),
      v1: this.formBuilde.control('', { validators: [Validators.required] }),
      v2: this.formBuilde.control('')
    })
    if (localStorage.getItem('listacomandos')) {
      comando.listaComandos = JSON.parse(localStorage.getItem('listacomandos'))
    }

    this.registradorClass.preencher();
    this.memoria.preencher();
  }
  alteracaoIntrucao() {
    var valor = this.InstrucaoForm.get('Instrucao').value;
    var itemLista = this.Instrucoes.find(x => x.id == valor);
    this.entradas = itemLista.entradas;
    if (this.entradas == 1) {
      this.InstrucaoForm.get('v2').setValue('');
      this.InstrucaoForm.get('v2').setValidators([]);
    } else {
      this.InstrucaoForm.get('v2').setValidators([Validators.required]);
    }
    this.InstrucaoForm.get('v2').updateValueAndValidity();

  }
  inserir() {
    if (this.InstrucaoForm.valid) {
      var Instrucao = this.InstrucaoForm.get('Instrucao').value;
      var ciclos = this.Instrucoes.find(x => x.id == Instrucao).ciclos;

      var item: comando = new comando(
        Instrucao,
        this.InstrucaoForm.get('dest').value,
        this.InstrucaoForm.get('v1').value,
        this.InstrucaoForm.get('v2').value,
        ciclos,
      )
      comando.listaComandos.push(item);
      localStorage.setItem('listacomandos', JSON.stringify(comando.listaComandos))
    }
  }
  limpar() {
    localStorage.removeItem('listacomandos');
    comando.listaComandos = [];
  }
  GetValurInstrucao(Cod) {
    var a = this.Instrucoes.find(x => x.id == Cod).valor;
    return a;
  }
  // Executar(){
  //   //ADD1|ADD2|MULT|LOAD/STORE
  //   const a  = [
  //     {chave:1, valor: "ADD1"},
  //     {chave:1, valor: "ADD2"},
  //     {chave:2, valor: "MULT"},
  //     {chave:3, valor: "LOAD/STORE"}
  //   ]
  // }
  variavelFucao = 0;
  Executar() {
    ExecutionUnit.execute();
    IF.fetch();
    OF.fetch();

    // var cmd = comando.listaComandos[this.variavelFucao]

    // Instrucao.executaInstrucao(cmd);
    // this.variavelFucao++;
  }
}

class comando {
  static listaComandos: comando[] = [];

  constructor(
    public Instrucao,
    public dest,
    public v1,
    public v2,
    public ciclos: number,
    public dec: boolean = false,
    public exe: boolean = false,
    public wb: boolean = false,
    public destV?: number,
    public Vv1?: number,
    public Vv2?: number,
  ) { }

}
class IF {
  static items: comando[] = []
  static countCommand = 0;

  static fetch() {
    this.items = [];
    this.items.push(comando.listaComandos[IF.countCommand]);
    IF.countCommand++;
  }
}
class OF {
  static fetch() {
    IF.items.forEach(x => {
      OF.decode(x);
    });
  }

  static decode(comando: comando) {
    let instrucao = Number(comando.Instrucao);
    switch (true) {

      case instrucao == 2 || instrucao == 7:
        OF.fetchADDIL(comando)
        break;
      
      case instrucao == 6:
        OF.fetchStore(comando)
        break;

      default:
        OF.fetchDefault(comando)
        break;
    }

    comando.dec = true;

    switch ((Number(comando.Instrucao))) {
      //Store
      case 6:
        StoreUnit.janela.push(comando)
        break;
      //Load
      case 7:
        LoadUnit.janela.push(comando)
        break;
      //Branch
      case 8:
        BranchUnit.janela.push(comando)
        break;
      //ALU
      default:
        ALU.janela.push(comando)
        break;
    }
  }

  static fetchADDIL(comando: comando) {
    var r1 = new idRegistrador(comando.v1)

    comando.Vv1 = Registrador.get(r1.tipo, r1.pos)
  }

  static fetchStore(comando: comando){
    var reg = new idRegistrador(comando.dest);

    comando.Vv1 = Registrador.get(reg.tipo, reg.pos);
  }

  static fetchDefault(comando: comando) {
    var r1 = new idRegistrador(comando.v1)
    var r2 = new idRegistrador(comando.v2)

    comando.Vv1 = Registrador.get(r1.tipo, r1.pos)
    comando.Vv2 = Registrador.get(r2.tipo, r2.pos)
  }

}

class ExecutionUnit {
  public static execute() {
    ALU.execute()
    BranchUnit.execute()
    StoreUnit.execute()
    LoadUnit.execute()
  }
}

class ALU {
  static janela: comando[] = [];
  public static execute() {
    for(let i = 0 ; i < ALU.janela.length; i++){
      if(ALU.janela[i].exe == true) // Se item já tiver sido executado, remova-o da lista de comandos
        ALU.janela.splice(i, 1);
    }

    var item = ALU.janela[0];

    if(item == undefined)
      return; // Retorna se a lista estiver vazia

    switch (Number(item.Instrucao)) {
      case 1:
        item.destV = ALU.ADD(item.dest, item.Vv1, item.Vv2)
        break;
      case 2:
        item.destV = ALU.ADD(item.dest, item.Vv1, item.v2)
        break;
      case 3:
        item.destV = ALU.SUB(item.dest, item.Vv1, item.Vv2)
        break;
      case 4:
        item.destV = ALU.MUL(item.dest, item.Vv1, item.Vv2)
        break;
      case 5:
        item.destV = ALU.DIV(item.dest, item.Vv1, item.Vv2)
        break;
    }

    item.exe = true;
  }
  
  static ADD(saida, v1, v2) {
    var reg = new idRegistrador(saida)
    var res = Number(v1) + Number(v2)
    Registrador.set(reg, res)
    return res
  }

  static SUB(saida, v1, v2) {
    var reg = new idRegistrador(saida)
    var res = Number(v1) - Number(v2)
    Registrador.set(reg, res)
    return res
  }

  static MUL(saida, v1, v2) {
    var reg = new idRegistrador(saida)
    var res = Number(v1) * Number(v2)
    Registrador.set(reg, res)
    return res
  }

  static DIV(saida, v1, v2) {
    var reg = new idRegistrador(saida)
    var res = Number(v1) / Number(v2)
    Registrador.set(reg, res)
    return res
  }
}

class BranchUnit {
  static janela: comando[] = [];
  public static execute() {
    // nn faco ideia do que por aqui
    // ideias: skippar ou voltar para posicao tal no array de comandos original
  }
}

class StoreUnit {
  static janela: comando[] = [];
  public static execute() {
    for(let i = 0 ; i < StoreUnit.janela.length; i++){
      if(StoreUnit.janela[i].exe == true) // Se item já tiver sido executado, remova-o da lista de comandos
        StoreUnit.janela.splice(i, 1);
    }

    var item = StoreUnit.janela[0];  // Seleciona o comando

    if(item == undefined)
      return; // Retorna se lista estiver vazia

    var reg = new idRegistrador(item.v1) // Obtem informações de onde o valor será escrito na memória
    var value = Registrador.get(reg.tipo, reg.pos);

    Memoria.store(item.Vv1, reg.offset, value); // Escreve o valor de v1 na memória

    item.exe = true; // Indica que a instrução finalizou sua fase de execução
  }
}

class LoadUnit {
  static janela: comando[] = [];
  public static execute() {
    for(let i = 0 ; i < LoadUnit.janela.length; i++){
      if(LoadUnit.janela[i].exe == true) // Se item já tiver sido executado, remova-o da lista de comandos
        LoadUnit.janela.splice(i, 1);
    }

    var item = LoadUnit.janela[0]; // Seleciona o comando

    if(item == undefined)
      return; // Retorna se lista estiver vazia

    var reg = new idRegistrador(item.v1) // Obtem informacoes de onde o valor será lido
    var value = Memoria.load(reg.offset, reg.pos) // Obtem o valor a ser escrito no registrador desejado
    var saida = new idRegistrador(item.dest); // Obtem informacoes do registrador em que o dado será escrito

    Registrador.set(saida, value); // Carrega o dado no registrador desejado

    item.exe = true; // Indica que a instrução finalizou sua fase de execução
  }
}

class Instrucao {

  constructor(
    public id: number,
    public valor,
    public ciclos,
    public entradas: number,
  ) { }

  static getLista() {
    var Instrucoes: Instrucao[] = [];
    Instrucoes.push(new Instrucao(1, 'ADD', 1, 2))
    Instrucoes.push(new Instrucao(2, 'ADDI', 1, 2))
    Instrucoes.push(new Instrucao(3, 'SUB', 1, 2))
    Instrucoes.push(new Instrucao(4, 'MUL', 1, 2))
    Instrucoes.push(new Instrucao(5, 'DIV', 1, 2))
    Instrucoes.push(new Instrucao(6, 'SW', 2, 1))
    Instrucoes.push(new Instrucao(7, 'LW', 2, 1))
    Instrucoes.push(new Instrucao(8, 'BEQ', 1, 2))
    return Instrucoes;
  }
  
  static BEQ(saida, v1, v2) {
    var pos1 = Number(String(v1).substring(1));
    var tipo1 = String(v1).charAt(0)
    var pos2 = Number(String(v2).substring(1));
    var tipo2 = String(v2).charAt(0)
    var posSaida = Number(String(saida).substring(1));
    var tipoSaida = String(saida).charAt(0)
    Registrador[`enderecos${tipoSaida}`][posSaida].valor =
      Registrador[`enderecos${tipo1}`][pos1].valor /
      Registrador[`enderecos${tipo2}`][pos2].valor;
  }

}

class Registrador {
  public static enderecosR: Registrador[];
  public static enderecosF: Registrador[];
  constructor(
    public id,
    public valor: number,
    public qi) { }

  public static preencher() {
    Registrador.enderecosR = [];
    Registrador.enderecosF = [];

    for (let i = 0; i < 32; i++) {
      var int = new Registrador(`R${i}`, 0, 0)
      var float = new Registrador(`F${i}`, 0.0, 0)

      Registrador.enderecosR.push(int);
      Registrador.enderecosF.push(float);
    }
  }
  public static get(tipo, pos) {
    return Registrador[`enderecos${tipo}`][pos].valor
  }
  public static set(reg: idRegistrador, value) {
    Registrador[`enderecos${reg.tipo}`][reg.pos].valor = value;
  }

}

class idRegistrador {
  tipo;
  pos;
  offset;
  constructor(id) {
    if (String(id).includes('(')) {
      var a = String(id).split('(');
      this.offset = Number(a[0]);
      this.pos = Number(String(a[1]).substring(1, a[1].length - 1));
      this.tipo = String(a[1]).charAt(0)
    } else {
      this.pos = Number(String(id).substring(1));
      this.tipo = String(id).charAt(0)
    }

  }
}

class Memoria {
  public static mem: number[][];

  public static preencher() {
    Memoria.mem = []
    for (let i = 0; i < 16; i++) {
      var linha: number[] = [];
      for (let j = 0; j < 16; j++) {
        linha.push(0)
      }
      Memoria.mem.push(linha);
    }
    console.log(Memoria.mem)
  }

  public static store(valor: number, offset: number, linha: number){
    Memoria.mem[linha][offset] = valor;
  }

  public static load(offset: number, linha: number){
    return Memoria.mem[linha][offset];
  }
}
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
  BufferReorder

  Instrucoes: Instrucao[];

  InstrucaoForm: FormGroup
  entradas = 0;
  total= 0;

  constructor(public formBuilde: FormBuilder) { }


  ngOnInit(): void {
    this.memoria = Memoria
    this.registradorClass = Registrador;
    this.comandos = comando;
    this.BufferReorder = BufferReorder;
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
    if (localStorage.getItem('listacomandos2')) {
      comando.listaComandos2 = JSON.parse(localStorage.getItem('listacomandos2'))
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
        0
      )
      comando.listaComandos.push(item);
      item = new comando(
        Instrucao,
        this.InstrucaoForm.get('dest').value,
        this.InstrucaoForm.get('v1').value,
        this.InstrucaoForm.get('v2').value,
        ciclos,
        0
      )
      this.InstrucaoForm.reset();
      comando.listaComandos2.push(item);
      localStorage.setItem('listacomandos', JSON.stringify(comando.listaComandos))
      localStorage.setItem('listacomandos2', JSON.stringify(comando.listaComandos2))
    }
  }
  Reset(){
    location.reload()
  }
  limpar() {
    localStorage.removeItem('listacomandos');
    localStorage.removeItem('listacomandos2');
    comando.listaComandos = [];
    comando.listaComandos2 = [];
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
    this.total++ ;
    WriteBack.writeBack();
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
  static listaComandos2: comando[] = [];

  constructor(
    public Instrucao,
    public dest,
    public v1,
    public v2,
    public ciclos: number,
    public ciclosAux: number = 0,
    public dec: boolean = false,
    public exe: boolean = false,
    public wb: boolean = false,
    public destV?: number,
    public Vv1?: number,
    public Vv2?: number,
    public naoExecutar:boolean=false
  ) { }

}

class IF {
  static items: comando[] = []
  static countCommand = 0;

  static fetch() {
    this.items = [];
    for(let i=0; i <2; i++){
      var x = comando.listaComandos[IF.countCommand]
      if (x) {
        this.items.push(x);
        IF.countCommand++;
      }
    }


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
    switch (instrucao) {

      case 2:
        OF.fetchADDI(comando)
        break;

      case 7:
        OF.fetchL(comando)
        break;

      case 6:
        OF.fetchStore(comando)
        break;
      case 8:
        OF.fetchBranch(comando)
        break;
      default:
        OF.fetchDefault(comando)
        break;
    }

    comando.dec = true;

    OF.pushToRChannel(comando);

  }

  static fetchADDI(comando: comando) {
    var r1 = new idRegistrador(comando.v1)
    var dest = new idRegistrador(comando.dest)

    comando.Vv1 = OF.getOrBlockReg(r1);
    comando.Vv2 = comando.v2;
    
    OF.addToBuffer(comando, dest, true)
  }

  static fetchL(comando: comando) {
    var r1 = new idRegistrador(comando.v1)
    var dest = new idRegistrador(comando.dest)

    comando.Vv1 = OF.getOrBlockReg(r1);
    // let newDestination = OF.checkRename(dest);
    // comando.dest = newDestination == dest? comando.dest : newDestination;

    OF.addToBuffer(comando, dest, true);
  }

  static fetchStore(comando: comando) {
    var reg = new idRegistrador(comando.dest);
    var operand = new idRegistrador(comando.v1);

    comando.Vv1 = OF.getOrBlockReg(reg);
    // let newDestination = OF.checkRename(operand);
    // comando.dest = newDestination == operand? comando.dest : newDestination;

    OF.addToBufferStore(comando, operand)
  }

  static fetchDefault(comando: comando) {
    var r1 = new idRegistrador(comando.v1)
    var r2 = new idRegistrador(comando.v2)
    var dest = new idRegistrador(comando.dest)

    comando.Vv1 = OF.getOrBlockReg(r1);
    comando.Vv2 = OF.getOrBlockReg(r2);
    // comando.dest = OF.checkRename(dest)
    
    OF.addToBuffer(comando, dest,(true))
  }
  static fetchBranch(comando: comando) {
    var r1 = new idRegistrador(comando.v1)
    var dest = new idRegistrador(comando.dest)
    
    comando.destV = OF.getOrBlockReg(dest); 
    comando.Vv1 = OF.getOrBlockReg(r1);
    comando.Vv2 = comando.v2;
    OF.addToBuffer(comando, dest,(comando.Vv1!=undefined && comando.destV!=undefined))
  }
  // Se o destino de alguma operação de alguma unidade funcional for o mesmo que o operando passado, bloquear, caso contrario, entregar valor do operando requisitado
  static getOrBlockReg(reg: idRegistrador): number {
    var isAvailable: boolean = true;

    var regFormatted = `${reg.tipo}${reg.pos}`;
    var commandBlock = ALU.janela.find(x => x.dest == regFormatted)
    // || StoreUnit.janela.find(x => x.dest == regFormatted)
    || LoadUnit.janela.find(x => x.dest == regFormatted)
    // || BranchUnit.janela.find(x => x.dest == regFormatted)

    if (commandBlock)
      isAvailable = false;

    return isAvailable ? Registrador.get(reg.tipo, reg.pos) : undefined;
  }

  // Se o destino de alguma operação alguma unidade funcional for o mesmo da operação atual, ou caso haja escrito apos leitura, renomeie. Caso contrario, faz nd nao
  static checkRename(reg: idRegistrador) {
    var isAvailable: boolean = true;

    var dest = `${reg.tipo}${reg.pos}`;
    var commandBlock = ALU.janela.find(x => ((x.v1 == dest || x.v2 == dest)&&!x.exe))
    || LoadUnit.janela.find(x => ((x.v1 == dest)&&!x.exe))
    || BranchUnit.janela.find(x =>((x.v1 == dest || x.v2 == dest)&&!x.exe))

    if (commandBlock)
      isAvailable = false;

    return isAvailable ? reg : BufferReorder.renameRegister(reg); // por gambiarra, retorna o que foi passado de parametro caso esteja tudo em ordem, caso contrario, renomeie
  }

  static addToBuffer(comando:comando, reg:idRegistrador,flag =false){
    let newDestination = OF.checkRename(reg);

    let newEntry;
    if(newDestination != reg && flag){ // Caso seja necessária uma renomeação, crie uma nova entrada no buffer indicando a mesma
      newEntry = new BufferEntry(newDestination, reg);
      comando.dest = newDestination;
    }
    else{ // Caso contrário, nao vai fazer nada
      newEntry = new BufferEntry(reg, reg);
    }

    BufferReorder.enqueue(newEntry);
  }

  static addToBufferStore(comando:comando, reg:idRegistrador){
    let newEntry;
    newEntry = new BufferEntry(reg, reg);
    BufferReorder.enqueue(newEntry);
  }
  
  static pushToRChannel(comando: comando) {
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

}

class ExecutionUnit {
  public static execute() {
  
    BranchUnit.execute()
    ALU.execute()
    StoreUnit.execute()
    LoadUnit.execute()
  
    
  }
}

class ALU {
  static janela: comando[] = [];
  public static execute() {
    let tam = ALU.janela.length
    for (let i = 0; i < tam; i++) {
      if (ALU.janela[i] && (ALU.janela[i].exe == true || ALU.janela[i].naoExecutar)) // Se item já tiver sido executado, remova-o da lista de comandos
        ALU.janela.splice(i, 1);
    }

    for(let i = 0; i< 2; i++){
      var item = ALU.janela[i];
      if (item && item.Vv1 != undefined && item.Vv2 != undefined) {
        this.executeULA(item);
      }
    }
  }

  public static executeULA(item: comando) {
    switch (Number(item.Instrucao)) {
      case 1:
      case 2:
        item.destV = ALU.ADD(item.dest, item.Vv1, item.Vv2)
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
    BufferReorder.update(item,'dest');
    WriteBack.writeBackItems.push(item);
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
  static skipCount = 0;
  static janela: comando[] = [];
  public static execute() {
    let tam = BranchUnit.janela.length
    for (let i = 0; i < tam; i++) {
      if (BranchUnit.janela[i] && (BranchUnit.janela[i].exe == true || BranchUnit.janela[i].naoExecutar)) // Se item já tiver sido executado, remova-o da lista de comandos
        BranchUnit.janela.splice(i, 1);
    }

  
    var item = BranchUnit.janela[0];
    if (item && item.Vv1 != undefined && item.Vv2 != undefined) {
      this.executeBranch(item);
    }
  }
  public static executeBranch(item:comando){

    if(item.Vv1 == item.destV){
      BranchUnit.skipCount = item.Vv2
      item.exe = true;
    }
    if(BranchUnit.skipCount > 0 ){
      var itens = comando.listaComandos.filter(x => x.exe == false);
      var max = BranchUnit.skipCount > itens.length? itens.length: BranchUnit.skipCount 
      for(let i =0;i < max; i++){
        itens[i].naoExecutar = true;
        BranchUnit.skipCount--;
      }
    }
  }
  public static reduceCounter(flag=false){
    if(BranchUnit.skipCount !=0){
      BranchUnit.skipCount--;
      BufferReorder.bufferQueue.shift()
      return true
    } else if(flag){
      BufferReorder.bufferQueue.shift()
      return false
    }
    return false
  }
}

class StoreUnit {
  static janela: comando[] = [];
  public static execute() {
    let tam = StoreUnit.janela.length
    for (let i = 0; i < tam; i++) {
      if (StoreUnit.janela[i] && (StoreUnit.janela[i].exe == true || StoreUnit.janela[i].naoExecutar)) // Se item já tiver sido executado, remova-o da lista de comandos
        StoreUnit.janela.splice(i, 1);
    }

    var item = StoreUnit.janela[0];  // Seleciona o comando

    if (item && item.Vv1 != undefined) {
      item.ciclosAux++;
      if (item.ciclosAux == item.ciclos)
        StoreUnit.store(item)
    }

  }

  public static store(item: comando) {
    var reg = new idRegistrador(item.v1) // Obtem informações de onde o valor será escrito na memória
    var value = Registrador.get(reg.tipo, reg.pos);

    Memoria.store(item.Vv1, reg.offset, value); // Escreve o valor de v1 na memória

    item.exe = true; // Indica que a instrução finalizou sua fase de execução
    item.destV = value;
    BufferReorder.update(item,'v1');
    WriteBack.writeBackItems.push(item);
  }
}

class LoadUnit {
  static janela: comando[] = [];
  public static execute() {
    let tam = LoadUnit.janela.length
    for (let i = 0; i < tam; i++) {
      if (LoadUnit.janela[i] && (LoadUnit.janela[i].exe == true || LoadUnit.janela[i].naoExecutar)) // Se item já tiver sido executado, remova-o da lista de comandos
        LoadUnit.janela.splice(i, 1);
    }

    var item = LoadUnit.janela[0]; // Seleciona o comando

    if (item && item.Vv1 != undefined && item.Vv1 != undefined) {
      item.ciclosAux++;
      if (item.ciclosAux == item.ciclos)
        LoadUnit.load(item)
    }

  }

  public static load(item: comando) {
    var reg = new idRegistrador(item.v1) // Obtem informacoes de onde o valor será lido
    var linha = Registrador.get(reg.tipo, reg.pos);
    var value = Memoria.load(reg.offset, linha) // Obtem o valor a ser escrito no registrador desejado
    var saida = new idRegistrador(item.dest); // Obtem informacoes do registrador em que o dado será escrito

    Registrador.set(saida, value); // Carrega o dado no registrador desejado
    item.destV = value;
    item.exe = true; // Indica que a instrução finalizou sua fase de execução
    BufferReorder.update(item,'dest');
    WriteBack.writeBackItems.push(item);
  }
}

class WriteBack {
  static writeBackItems: comando[] = []

  public static writeBack() {
    var itens = comando.listaComandos.filter(x => x.naoExecutar == true);
    var size = itens.length
    for(let i =0;i < size; i++){
      BufferReorder.removeComand(itens[i],)
    }
    WriteBack.writeBackItems.forEach(comando => {
      if(!comando.wb){
        ALU.janela.forEach(x => {
          if (x.Vv1 == undefined && x.v1 == comando.dest) {
              x.Vv1 = comando.destV;
              
          }
          else if (x.Vv2 == undefined && x.v2 == comando.dest) {
              x.Vv2 = comando.destV;
      
          }
        })
  
        StoreUnit.janela.forEach(x => {
          if (x.Vv1 == undefined && x.dest == comando.dest) {
              x.Vv1 = comando.destV;
            
          }
        })
  
        LoadUnit.janela.forEach(x => {
          if (x.Vv1 == undefined && x.v1 == comando.dest) {
              x.Vv1 = comando.destV;
            
          }
        })
        BranchUnit.janela.forEach(x => {
          if (x.Vv1 == undefined && x.v1 == comando.dest) {
              x.Vv1 = comando.destV;

          }
          else if (x.destV == undefined && x.dest == comando.dest) { 
              x.destV = comando.destV;
          }
          BranchUnit.reduceCounter(true)
          
          
        })
      }

      comando.wb = true;
    })
    BufferReorder.writeToRDB();
  }
}

class BufferReorder {
  static bufferQueue: BufferEntry[] = []

  public static enqueue(reg: BufferEntry) {
    this.bufferQueue.push(reg);
  }

  public static update(comando:comando,par) {
    let i = BufferReorder.bufferQueue.findIndex(x => x.rename ==  new idRegistrador(comando[par]).toString());
    if(i != -1){
      BufferReorder.bufferQueue[i].value = comando.destV
      BufferReorder.bufferQueue[i].rename = BufferReorder.bufferQueue[i].originalName
      comando[par] = BufferReorder.bufferQueue[i].originalName;
    }

  }

  public static renameRegister(dest:idRegistrador){
    let rename = new BufferEntry(Registrador.getFirstRenameAvailable(), `${dest.tipo}${dest.pos}`)
    return rename.rename;
  }
  public static removeComand(comando:comando){
    let i
    if(comando.Instrucao != 6)
      i = BufferReorder.bufferQueue.findIndex(x => x.rename ==  new idRegistrador(comando.dest).toString());
    else{
      i = BufferReorder.bufferQueue.findIndex(x => x.rename ==  new idRegistrador(comando.dest).toString());
    }
    if(i != -1)
      BufferReorder.bufferQueue.splice(i,1);
  }
  public static writeToRDB() {
    let canWrite: boolean = true;

    while (canWrite && BufferReorder.bufferQueue.length) {
      let item = BufferReorder.bufferQueue[0]

      if (item.originalName == item.rename && item.value != undefined) {
        let reg = new idRegistrador(item.originalName)
        Registrador.set(reg, item.value)
        BufferReorder.bufferQueue.shift()
        BufferReorder.removeComand(item.rename);
      }
      else {
        canWrite = false; // FIFO, se o primeiro nao pode sair, ngm pode
      }
    }
  }
}

class BufferEntry {
  constructor(
    public rename, 
    public originalName,
    public value?:number,
     
  ) {
    this.rename = rename.toString();
    this.originalName = originalName.toString();
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
  public static enderecosRN: Registrador[];

  constructor(
    public id,
    public valor: number,
    public qi) { }

  public static preencher() {
    Registrador.enderecosR = [];
    Registrador.enderecosF = [];
    Registrador.enderecosRN = [];

    for (let i = 0; i < 32; i++) {
      var int = new Registrador(`R${i}`, 0, 0)
      var float = new Registrador(`F${i}`, 0.0, 0)
      var rename = new Registrador(`R${String.fromCharCode(65 + i)}`, 0, -1)

      Registrador.enderecosR.push(int);
      Registrador.enderecosF.push(float);
      Registrador.enderecosRN.push(rename);
    }
  }

  public static get(tipo, pos) {
    var isAChar =/^[a-zA-Z]+$/.test(pos);
    var char = isAChar?  (String(pos).charCodeAt(0)-65): Number(pos);
    return Registrador[`enderecos${tipo}`][char].valor
  }

  static getFirstRenameAvailable(): any {
    let firstAvailable = this.enderecosRN.find(x => x.qi == -1)
    firstAvailable.qi = 0;

    return firstAvailable.id;
  }
  static resetOne(id): any {
    let firstAvailable = this.enderecosRN.find(x => x.id == id)
    firstAvailable.valor= 0;
    firstAvailable.qi = -1;
  }

  public static set(reg: idRegistrador, value) {
    var isAChar =/^[a-zA-Z]+$/.test(reg.pos);
    var char = isAChar? (String(reg.pos).charCodeAt(0)-65) : Number(reg.pos);

    if(isAChar){
      Registrador.enderecosRN[char].valor = value;
    }else{
      Registrador[`enderecos${reg.tipo}`][char].valor = value;
    }
   
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
        this.pos = String(a[1]).substring(1, a[1].length - 1);
        this.tipo = String(a[1]).charAt(0)
      } else {
        this.pos = String(id).substring(1);
        this.tipo = String(id).charAt(0)
      }
    }

  toString(){
    return `${this.tipo}${this.pos}`
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

  public static store(valor: number, offset: number, linha: number) {
    Memoria.mem[linha][offset] = valor;
  }

  public static load(offset: number, linha: number) {
    return Memoria.mem[linha][offset];
  }
}
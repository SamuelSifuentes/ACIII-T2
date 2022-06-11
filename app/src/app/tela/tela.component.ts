import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms'
@Component({
  selector: 'app-tela',
  templateUrl: './tela.component.html',
  styleUrls: ['./tela.component.css']
})
export class TelaComponent implements OnInit {
  instrucoes: instrucao[];
  enderecos: String[] = ['r1','r2','r3','r4'];
  listaComandos: comando[] = [];
  InstrucaoForm: FormGroup 
  entradas = 0;
  constructor(public formBuilde: FormBuilder) { }

  
  ngOnInit(): void {
    this.instrucoes = instrucao.getLista();
    this.InstrucaoForm = this.formBuilde.group({
     instrucao: this.formBuilde.control('',{validators: [Validators.nullValidator]}),
     endereco: this.formBuilde.control('',{validators: [Validators.nullValidator]}),
     v1: this.formBuilde.control('',{validators: [Validators.nullValidator]} ),
     v2: this.formBuilde.control('')
    })

    
  }
  alteracaoIntrucao(){
    var valor = this.InstrucaoForm.get('instrucao').value;
    var itemLista = this.instrucoes.find(x => x.id = valor);
    this.entradas = itemLista.entradas;
    if(this.entradas == 1){
      this.InstrucaoForm.get('v2').setValue('');
      this.InstrucaoForm.get('v2').setValidators([]);
    }else{
      this.InstrucaoForm.get('v2').setValidators([Validators.nullValidator]);
    }
    
  }
  inserir(){
    if(this.InstrucaoForm.valid){
      var instrucao = this.InstrucaoForm.get('instrucao').value;
      var ciclos = this.instrucoes.find(x => x.id == instrucao).ciclos;
      
      var item: comando = new comando(
        instrucao,
        this.InstrucaoForm.get('endereco').value,
        this.InstrucaoForm.get('v1').value,
        this.InstrucaoForm.get('v2').value,
        ciclos,
      )
      this.listaComandos.push(item);
    }

    
  }
  GetValurInstrucao(Cod){
    var a= this.instrucoes.find(x => x.id == Cod).valor;
    return a;
  }

}

class comando{
  constructor(
    public instrucao, 
    public endereco ,
    public v1,
    public v2,
    public ciclos:number
    ){}

}
class instrucao {
  
  constructor(
    public id:number,
    public valor, 
    public ciclos ,
    public entradas: number,
    ){}

  static getLista(){
    var instrucoes:instrucao[]=[];
    instrucoes.push(new instrucao(1,'ADD',1,2))
    instrucoes.push(new instrucao(2,'MULT',1,2))
    instrucoes.push(new instrucao(3,'LOAD/STORE',2,1))
    
    return instrucoes;
  }
}

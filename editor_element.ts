export interface EditorElementData {
    instance_id : string;
    pos : { x : number, y : number }  
}

export interface Position {
    x : number,
    y : number,
}
export abstract class EditorElement implements EditorElementData{

    instance_id : string;

    element:d3.Selection<Object>;

    pos : Position;

    constructor (){
      this.pos = {
        x : 0,
        y : 0
      };
    }

    set_view ( element:d3.Selection<Object>){
        this.element = element;
    }

    abstract draw ()
}
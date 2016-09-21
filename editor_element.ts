

export class EditorElement{
    element:d3.Selection<Object>;

    pos : { x : number, y : number };

    set_view ( element:d3.Selection<Object>){
        this.element = element;
    }

    draw (){

    }
}
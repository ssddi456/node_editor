


export function uuid ( tpl? :string) : string {
  return (tpl || "xxyxxyxx4xxxyxxx").replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0;
    var v = c == "x" ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}
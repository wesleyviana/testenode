import crypto from 'crypto';


interface BingoCardStrategy {
    geraCartela(): void;
    temBolaSorteada(number: number): boolean;
    checkWin(): boolean;
    mostraCartelas(): void;
    setIdCartela(idCartela: number): void;
    getIdCartela(): number;
    printaNumeroAcertosBingo(): void;
}

export class BingoCard implements BingoCardStrategy {
    private card: number[][];
    private marked: boolean[][];
    private static readonly ROWS = 5;
    private static readonly COLS = 5;
    private static readonly COL_RANGES = [1, 16, 31, 46, 61];
    private idCartela: number;
    private numeroAcertosBingo: number;

    constructor() {
        this.card = Array(BingoCard.ROWS).fill(null).map(() => Array(BingoCard.COLS).fill(0));
        this.marked = Array(BingoCard.ROWS).fill(null).map(() => Array(BingoCard.COLS).fill(false));
        this.idCartela = 0;
        this.numeroAcertosBingo = 0;
    }

    geraCartela(): number[][] {
        for (let col = 0; col < BingoCard.COLS; col++) {
            const numbers: number[] = [];
            const min = col * 15 + 1;
            const max = min + 15;
            for (let row = 0; row < BingoCard.ROWS; row++) {
                let num: number;
                do {
                    num = crypto.randomInt(min, max);
                    if (col === 0 && row === 0 && num > 10) {
                        col = row;
                    }
                } while (numbers.includes(num));
                numbers[row] = num;
                this.card[row][col] = num;
            }
        }
        // Espaço livre no centro
        this.card[2][2] = 0;
        this.marked[2][2] = true;
        return this.card;
    }

    temBolaSorteada(number: number): boolean {
        for (let row = 0; row < BingoCard.ROWS; row++) {
            for (let col = 0; col < BingoCard.COLS; col++) {
                if (this.card[row][col] === number) {
                    this.marked[row][col] = true;
                    this.numeroAcertosBingo++;
                    this.printaNumeroAcertosBingo();
                    return true;
                }
            }
        }
        return false;
    }

    checkWin(): boolean {
        let temTodasLinhas = false;
        let temTodasColunas = false;
        let qtdAcertosLinhas = 0;
        let qtdAcertosColunas = 0;

        for (let row = 0; row < BingoCard.ROWS; row++) {
            if (this.checkRow(row)) qtdAcertosLinhas++;
        }
        if (qtdAcertosLinhas === BingoCard.ROWS) {
            temTodasLinhas = true;
            for (let col = 0; col < BingoCard.COLS; col++) {
                if (this.checkColumn(col)) qtdAcertosColunas++;
            }
            if (qtdAcertosColunas === BingoCard.COLS) temTodasColunas = true;
        }

        if (temTodasColunas && temTodasLinhas && this.numeroAcertosBingo < 24) {
            for (let row = 0; row < BingoCard.ROWS; row++) {
                if (this.checkRow(row)) temTodasLinhas = true;
            }
            for (let col = 0; col < BingoCard.COLS; col++) {
                if (this.checkColumn(col)) temTodasColunas = true;
            }
        }
        return temTodasColunas && temTodasLinhas;
    }

    private checkRow(row: number): boolean {
        return this.marked[row].every(cell => cell);
    }

    private checkColumn(col: number): boolean {
        return this.marked.every(row => row[col]);
    }

    mostraCartelas(): void {
        console.log("------------------");
        console.log(" B  I  N    G   O");
        console.log("------------------");
        for (let row = 0; row < BingoCard.ROWS; row++) {
            for (let col = 0; col < BingoCard.COLS; col++) {
                if (this.card[row][col] === 0) {
                    process.stdout.write("X  ");
                } else {
                    process.stdout.write(`${this.card[row][col].toString().padStart(2)} ${this.marked[row][col] ? "*" : " "} `);
                }
            }
            console.log();
        }
    }

    setIdCartela(idCartela: number): void {
        this.idCartela = idCartela;
    }

    getIdCartela(): number {
        return this.idCartela;
    }

    printaNumeroAcertosBingo(): void {
        // console.log(` Cartela: ${this.idCartela}  -  Numero Acertos: ${this.numeroAcertosBingo}`);
    }
}

export class SorteioBingo {
    public idSorteio: number;
    private numbers: string[];
    private currentIndex: number;
    private marcados: boolean[][];
    private numerosSorteados: number[];
    private cartelasParticipantes: BingoCardStrategy[];
    private numeroSorteio: number;
    private temVencedor: boolean;

    constructor() {
        this.idSorteio = crypto.randomInt (0,Number.MAX_SAFE_INTEGER);
        this.numbers = [];
        this.currentIndex =0;
        this.numerosSorteados = [];
        this.marcados = Array(5).fill(null).map(() => Array(5).fill(false));
        this.temVencedor = false;
        this.cartelasParticipantes = [];
        this.numeroSorteio = 0;
    }

    isTemVencedor(): boolean {
        return this.temVencedor;
    }

    recebeCartelasParticipantes(cartelasParticipantes: BingoCardStrategy[]): void {
        this.cartelasParticipantes = cartelasParticipantes;
    }

    bolaJaSorteada(numero: number): boolean {
        return this.numerosSorteados.includes(numero);
    }

    getListaBolasSorteadas(): string {
        return this.numerosSorteados.join(" ");
    }

    sortearBola(): void {
        let bola: number;
        do {
            bola = crypto.randomInt(1, 76);
        } while (this.bolaJaSorteada(bola));
        this.numerosSorteados.push(bola);
        this.verificaAcertoCartelas(bola);
        this.currentIndex++;
        this.numeroSorteio++;
    }

    private verificaAcertoCartelas(numeroBola: number): void {
        let qtdVencedores = 0;
        for (const cartela of this.cartelasParticipantes) {
            cartela.temBolaSorteada(numeroBola);
            if (cartela.checkWin()) {
                qtdVencedores++;
                console.log(` BINNNGOOOO   GANHOU Cartela : ${cartela.getIdCartela()}`);
            }
        }
        if (qtdVencedores > 0) this.temVencedor = true;
    }

    private initializeNumbers(): void {
       
        for (let i = 1; i <= 15; i++) this.numbers.push(`B${i}`);
        for (let i = 16; i <= 30; i++) this.numbers.push(`I${i}`);
        for (let i = 31; i <= 45; i++) this.numbers.push(`N${i}`);
        for (let i = 46; i <= 60; i++) this.numbers.push(`G${i}`);
        for (let i = 61; i <= 75; i++) this.numbers.push(`O${i}`);
        this.shuffleArray(this.numbers);
        this.currentIndex = 0;
    }

    private shuffleArray<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    reset(): void {
        this.shuffleArray(this.numbers);
        this.currentIndex = 0;
    }

    getDrawnNumbers(): string[] {
        return this.numbers.slice(0, this.currentIndex);
    }

    getRemainingNumbers(): string[] {
        return this.numbers.slice(this.currentIndex);
    }

    getNumeroDeSorteios(): number {
        return this.numeroSorteio;
    }
}

function bingoTest(): void {
    const num: number[] = [];
    for (let y = 0; y < 1; y++) {
        const listaJogos: BingoCardStrategy[] = [];
        for (let i = 1; i <= 100; i++) {
            const bingoCard = new BingoCard();
            bingoCard.setIdCartela(i);
            bingoCard.geraCartela();
            listaJogos.push(bingoCard);
        }

        const sorteioBingo = new SorteioBingo();
        sorteioBingo.recebeCartelasParticipantes(listaJogos);
        while (!sorteioBingo.isTemVencedor()) {
            sorteioBingo.sortearBola();
        }
        console.log(` Tempo Estimado de Partida Em minutos : ${(sorteioBingo.getNumeroDeSorteios() * 3) / 60}`);
        num.push((sorteioBingo.getNumeroDeSorteios() * 3) / 60);
    }
    console.log(` > ${num.toString()}`);
}

//bingoTest();

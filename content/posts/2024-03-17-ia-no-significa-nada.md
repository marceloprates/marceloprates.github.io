---
title: "IA não significa nada"
date: "2024-03-17"
tags: []
categories: []
excerpt: "<img src='https://upload.wikimedia.org/wikipedia/commons/a/ab/Armillaria_ostoyae.jpg'>"
original_path: "_posts/2024-3-17-IA.md"
---

>Armillaria ostoyae.
![](https://upload.wikimedia.org/wikipedia/commons/a/ab/Armillaria_ostoyae.jpg)


Faz tempo que venho pensando o seguinte: o termo "Inteligência Artificial" não significa nada. Gosto de uma citação do Miguel Nicolelis:

> A "IA" não é inteligente nem artificial.

O que ele quer dizer com isso é:
- Falta a esses sistemas atributos do que possa ser considerado "inteligente", e
- *Machine Learning* (Aprendizado de Máquina) não tem nada de "artificial". É só um *proxy* pro conhecimento humano, afinal, esses sistemas são treinados com dados produzidos por humanos e anotados por humanos.

Não me interessa muito definir o que é e o que não é "inteligente". Acho uma discussão meio abstrata e cansativa. Mas quero trazer algumas reflexões práticas sobre o assunto. Principalmente, sobre o que as pessoas entendem por "Inteligência Artificial" e como as noções mais comuns sobre o termo são enganosas.

## "São tudo IFs":

Um meme muito popular regularmente viraliza nas redes sociais. Ele consiste em "desmascarar" a inteligência artificial naquilo que supostamente seria a sua verdadeira essência: vários *if-statements* encadeados. Algo nessa linha:

![](/images/misc/AI-if-statements.png)

Acho esses memes interessantes porque eles permitem refletir sobre o que o termo "Inteligência Artificial" significa pra maioria das pessoas.

Acho importante introduzir a discussão com uma pergunta: 

> Afinal, qual o problema se as "IAs" forem compostas de IFs?

**Quase tudo** na computação é composto por IFs no seu nível mais baixo. Mas tem outra coisa:

> O que chamamos de "IA" hoje em dia (*Deep Learning*) **não é** composto de IFs. O paradigma é outro, os constituintes básicos são multiplicações de matrizes.

E finalmente:

> Pouco importa quais são as operações mais básicas. Isso é arbitrário.

Tanto isso é verdade que, ainda que a fundamentação matemática de *Deep Learning* consista em multiplicações de matrizes, a nível de hardware essas operações se traduzem em IFs, ou, no mínimo, em algo muito parecido com isso (portas NAND). Da mesma forma, poderia se pensar numa arquitetura de hardware alternativa focada em *Deep Learning* onde a operação mais básica fosse multiplicação de matrizes (seguida de uma função de ativação, como ReLU). Ambas são computacionalmente equivalentes, Turing-completas. Ou, melhor, nenhuma das duas é efetivamente Turing-completa por limitações de memória, mas ambas são equivalentas a uma Máquina de Turing com fita finita, o que pra propósitos práticos dá no mesmo. Ou seja: foda-se.

Pra piorar, muitos modelos que se convencionou chamar de "IA" são, mesmo, baseados em IFs encadeados (árvores de decisão).

- Eles são **menos** IA que *Deep Learning*?
- É **pior** se tiver IFs?
- **Quais** são as arquiteturas consideradas "válidas" para que possamos classificar um sistema como "IA"?
- **Quem** decide isso? E, não menos importante:
- **Qual o sentido** de atribuir "inteligência" a um sistema com base nas suas operações mais básicas (cuja escolha é, lembrando, completamente arbitrária)?

Isso diz muito sobre a confusão que se criou em torno do termo "Inteligência Artificial", que, a rigor, não significa *absolutamente nada*. Mas mais importante, a histeria sobre os IFs diz muito sobre os critérios mentais (muitas vezes inconscientes) que as pessoas usam como régua para separar a "IA" de todo o resto.

## O Argumento da Sala Chinesa

O [*Argumento da Sala Chinesa*](https://en.wikipedia.org/wiki/Chinese_room) (John Searle) é um experimento mental que se propõe a demonstrar que

> Um computador digital executando um programa não pode ter uma "mente", "compreensão" ou "consciência".

Ele propõe a existência de um autômato hipotético cujo funcionamento é o de conversar em Chinês fluente por meio de texto com um usuário humano. Ele recebe sequências de papeizinhos marcados com caracteres chineses como entrada e produz sequências de papeizinhos marcados com caracteres chineses como saída. Dentro do autômato, que é uma grande sala, reside um operador humano que não entende nada de Chinês, mas executa instruções metodicamente a partir de um manual.

Pro Searle, o argumento demonstra que tal autômato hipotético, ainda que possa exibir comportamento aparentemente inteligente, não compreende o que faz, portanto não tem nada que possa se chamar de "mente" e muito menos uma consciência.

Nesse sentido é muito tentador declarar que programas consistindo em IFs encadeados não são "IA", porque a mente humana não é uma cadeia de IFs e, se a "IA" é diferente do cérebro humano ou mais simples do que ele, ela não é realmente "inteligente". O problema é que se o cérebro humano não é um monte de IFs no seu nível mais básico, ele é uma coisa tão banal quanto - uma bomba de sódio e potássio. No fundo tudo são processos essencialmente mecânicos de física e química. Não existe, e não poderia existir, compreensão no nível do IF, do mesmo modo como não existe compreensão no nível de uma célula nervosa. A discussão claramente não é essa.

> OBS: o livro [*Gödel, Escher, Bach*](https://en.wikipedia.org/wiki/G%C3%B6del,_Escher,_Bach) do Douglas Hofstadter discute em profundidade a ideia de que a "inteligência" só pode ser compreendida como uma propriedade emergente de sistemas compostos de inúmeros componentes desprovidos dela.
![](https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Godel%2C_Escher%2C_Bach_%28first_edition%29.jpg/390px-Godel%2C_Escher%2C_Bach_%28first_edition%29.jpg?20231225030952)

Acho que a histeria dos IFs tem bastante a ver com o Argumento da Sala Chinesa. Na cabeça das pessoas, um sistema que somos capazes de entender - ainda que somente no seu nível mais básico, sem que compreendamos as suas propriedades emergentes -, não pode ser considerado "inteligente". Isso explica em parte porque as pessoas são apressadas em classificar árvores de decisão como "desinteligentes" ao mesmo tempo que aceitam com naturalidade modelos baseados em *Deep Learning* (e.g. ChatGPT) como muito mais impressionantes do que eles realmente são: A ideia de uma operação condicional, um IF, é compreensível pra maioria das pessoas, ao passo que multiplicações de matrizes, descida de gradiente e outros componentes de *Deep Learning* não o são. Só que, no fundo, IFs e multiplicações de matrizes são só duas operações matemáticas diferentes, e nenhuma é mais ou menos especial ou sofisticada que a outra.

## A inteligência humana não é "geral"

Muito se fala, em parte pela surpreendente operação de marketing conduzida pelas big tech, em "AGI" (*Artificial General Intelligence*, ou "Inteligência Artificial Geral"). A oximorônica "Open"AI parte desse conceito para definir a sua missão na terra (de um ponto de vista de relações públicas - A verdadeira missão da OpenAI é lucrar com a privatização da riqueza socialmente na internet por meio de uma API paga). O CEO da empresa, Sam Altman, e demais *coaches* de IA descrevem o objetivo da empresa como o desenvolvimento da tecnologia que nos levará à mitológica *AGI*. Esse tópico é bastante batido mas vale a pena destrinchar um pouco o assinto.

A maioria dos *coaches* de IA partem do pressuposto messiânico e pseudocientífico de que o desenvolvimento da IA eventualmente nos levará a uma "inteligência" equivalente à humana, que, pra eles, é a zona limítrofe que separa a "IA" especializada que existe hoje de uma hipotética IA "Geral", capaz de tudo. A partir desse momento seríamos ultrapassados pela máquina e atingiríamos a "singularidade", um ponto de inflexão no qual o desenvolvimento da "IA" se tornaria autônomo e a sua evolução, exponencial. Qualquer semelhança com narrativas bíblicas sobre o fim dos tempos não é mera coincidência. Faz tempo que tenho notado paralelos entre a pseudociência marqueteira dos *coaches* de "IA" e o fanatismo religioso.

Um dos meus pesquisadores preferidos, na área de *Machine Learning*, é o [Yann LeCun](https://en.wikipedia.org/wiki/Yann_LeCun). Gosto dele principalmente pelo pragmatismo e pé-no-chão. Ele pensa com a cabeça de um engenheiro, o que, no mundo corporativo da pesquisa industrial em "IA" é um mérito enorme. Os engenheiros podem ter os seus vieses na maneira que enxergam o mundo, mas penso que é extremamente importante que tratêmos essas tecnologias de maneira sóbria, sem narrativas pseudocientíficas ou extravagantes. Muito melhor um engenheiro do que um *coach* pra conduzir a divisão de IA da Meta. Mas enfim, o LeCun defende uma posição sobre "AGI" à qual eu subscrevo:

> A ideia de que a inteligência humana é o ponto de partida pra "AGI" parte da falsa premissa de que a inteligência humana é, em si, "geral". Isso não poderia ser mais longe da realidade: a inteligência humana, como a de qualquer mamífero, ou, no limite, de qualquer animal ou ser vivo, não é geral. Ela é **altamente** especializada.

Atribuir ao cérebro humano esse patamar limítrofe entre a cognição animal e uma hipotética inteligência divina é pseudocientífico, e, sobretudo, risível. Penso que isso tem muito a ver com o fetiche ocidental pela cosmovisão abraâmica, que atribui ao ser humano o status de "imagem e semelhança de deus*."

\* Ortografia: "deus" se escreve descapitalizado.

## A "IA" não é especial. E também nós não somos especiais

Uma pergunta que recebo frequentemente em resposta aos meus comentários críticos sobre "IA" é o seguinte:

> Mas tu não acha *impressionante* as coisas que o ChatGPT consegue fazer?

O que eu acho realmente impressionante é que tenhamos levado tanto tempo pra reconhecer que certas capacidades de processamento de linguagem natural apresentadas pelo ChatGPT talvez não sejam tão complexas quanto gostaríamos de pensar que são (aqui cabe um *disclaimer* de que o ChatGPT e LLMs em geral **não são** tão poderosos quanto gostamos de pensar que são e que boa parte disso é marketing).

O motivo pelo qual eu faço essa inversão é simples. A arquitetura do ChatGPT não é diferente da de um preditor ortográfico de celular. Ele usa um modelo [Transformer](https://en.wikipedia.org/wiki/Transformer_(deep_learning_architecture)) pra modelar uma distribuição de probabilidade condicional que permite estimar, dado uma sequência de palavras (na verdade *tokens*, pedaços de palavras), as probabilidades de que ela seja seguida por cada outra palavra possível, dado um vocabulário fixo e um conjunto de dados a partir do qual as estatísticas dessa distribuição são modeladas. O ChatGPT produz texto amostrando repetidamente a palavra seguinte de distribuições de probabilidade. Que esse tipo de arquitetura, que no nível mais baixo se traduz em multiplicações de matrizes, e no nível mais alto funciona como um preditor ortográfico glorificado, consiga resolver tarefas que julgávamos complexas diz muito mais sobre a simplicidade dessas tarefas do que sobre uma suposta "inteligência" do ChatGPT.

Evidentemente, o nosso contato com esse fato é uma espécie de ferida narcísica. Dói reconhecer que a capacidade de desempenhar certas tarefas - por mais simples que sejam - de processamento de linguagem natural não são mais exclusividade da nossa espécie. Na sua mania de grandeza, o ser humano gosta de usar a linguagem como uma espécie de régua que nos separaria das formas de vida "inferiores". Nesse sentido, é compreensível que assistir um preditor ortográfico glorificado executando tarefas de linguagem faça com que nos sintamos "destronados" de algum espaço especial que gostaríamos de pensar que ocupamos na Natureza.


Em [*From Bacteria to Bach and Back*](https://en.wikipedia.org/wiki/From_Bacteria_to_Bach_and_Back), Daniel Dennett propõe um conceito semelhante ao das "feridas narcísicas" de Freud.

![](https://upload.wikimedia.org/wikipedia/en/f/f6/From_Bacteria_to_Bach_and_Back.jpg?20171016231313)

Para Freud, as 3 feridas narcísicas são:

- Copérnico: A terra não é o centro do universo.
- Darwin: O *Homo Sapiens* é só mais uma espécie tão desimportante quanto todas as outras.
- Freud: O ser humano não tem controle pleno da sua própria mente.

Dennet propõe um conceito semelhante ao comentar as "invertidas" (no inglês original, *inversions*) de Darwin e Turing. A teoria da seleção natural proposta por Darwin demonstra que processos muito simples, consistindo numa mistura de aleatoriedade com filtragem, são capazes de produzir estruturas complexas com comportamento aparentemente "inteligente". E a [Tese de Chuch-Turing](https://en.wikipedia.org/wiki/Church%E2%80%93Turing_thesis), de modo parecido, demonstra que processos algorítimicos sofisticados podem emergir das regras mais simples possíveis (**quase tudo** na Natureza é Turing-Completo). Para Dennet, isso demonstra um fato que, num primeiro momento, pode parecer contraintuitivo: é possível que haja *Competência sem Compreensão*. A "evolução" não entende e muito menos tem agência sobre o que faz, porque não é obra do "design inteligente" de algum ser divino, mas tão somente um processo pelo qual a realidade física passa. Da mesma forma, os computadores não sabem de si. Ainda assim, ambas, a biologia e a computação, produzem comportamentos complexos que muitos não têm problema em chamar de "inteligentes".

>Uma máquina de Turing em 2D ("*Turmite*")
<img src='/images/misc/turmite.gif'>

Quero focar aqui na invertida do Turing: ela é autoevidente. É óbvio que é possível produzir competência sem compreensão, porque *o cérebro mamaliano* funciona assim. De novo, no nível mais baixo, todo o nosso processo mental se resume a processos essencialmente mecânicos, ou, eventualmente, aleatórios. Essas são as duas únicas possibilidades: quaisquer processos intermediários por trás do que chamamos "inteligência" são ou mecânicos, determinísticos, ou randômicos, imprevisíveis. Não existe terceira opção. Algumas pessoas não aceitam que seja possível emular, mesmo num cenário hipotético, o cérebro humano (ou funções suas) com um programa de computador. Mas negar essa possibilidade é uma negação do materialismo em si. As únicas coisas que existem são a realidade física e as leis da natureza, e o cérebro humano certamente não é mais do que Turing-Completo. Mesmo que fosse, bastaria emulá-lo com uma arquitetura de hardware de poder semelhante. Os constituintes básicos do cérebro são todos parte da realidade material e estão disponíveis se precisarmos montar um computador diferente.

Com isso queria concluir dizendo que, a meu ver, não faz sentido pensar que trazer a "IA" ao nível da inteligência humana deveria ser uma meta. Porque, honestamente, não tem nada de generalista ou especial sobre a inteligência humana. A evolução moldou o nosso cérebro pra comer frutas, caminhar nas pernas traseiras e fazer uma série de outras coisas que são particulares da nossa espécie. A evolução moldou o cérebro dos polvos pra fazer coisas diferentes. Cada ser vivo tem as suas próprias particularidades e capacidades específicas. O maior ser vivo do mundo é um *Armillaria ostoyae*, um fungo de 965 hectares que vive há milhares de anos no solo de uma floresta entre os EUA e o Canadá. Nós somos mais importantes que ele por quê? Não somos. Não existe hierarquia na natureza. Nós não somos mais importantes que as cianobactérias - somos provavelmente um pouco menos interessantes, porque não fomos sorteados com a bioluminescência na loteria genética. Vida que segue.

## "O que faremos quando a IA automatizar tudo?"

Outra pergunta muito comum que eu recebo, que reflete um desespero, uma angústia enorme sobre o desenvolvimento da "IA", é essa:

> Me preocupa que a "IA" esteja avançando rápido demais e desempenhando tarefas complexas que antes eram exclusividade nossa. O que vamos fazer quando a "IA" automatizar tudo que fazemos?

Sei lá? nada. Não existe **nada** de especial que *deveríamos* estar fazendo além de comer, dormir, nos hidratar e fazer exercício físico. Somos animais. Nossa existência não tem um propósito específico, muito menos grandioso.

Claro, existe um problema importante no que diz respeito ao desenvolvimento e evolução da "IA", que é o uso que progressivamente tem sido feito dessas tecnologias para precarizar as relações de trabalho. Essa é uma preocupação legítima e urgente. Se possível, seria importante evitar que a automação progressiva da força de trabalho - e, principalmente, a **ilusão** de automação trazida pelo *Machine Learning*, que muitas vezes atua como um *proxy* para precarizar o trabalho humano ainda indispensável para treinar esses sistemas -, nos encaminhasse para um cenário distópico de *tecnofeudalismo*. Mas isso é outra história, e tem muito menos a ver com a "IA" em si do que com o sistema econômico ao qual estamos submetidos.

Preocupação **filosófica** com a "IA" eu não tenho nenhuma. Pelo contrário: acho muito positivo que os avanços trazidos por ela estejam colaborando para "destronar" a nossa espécie de um pedestal que atribuímos a nós mesmos, de uma posição de importância no *Grande Esquema das Coisas* que nós nunca realmente ocupamos, só porque ainda nos submetemos aos ensinamentos de alguns livros de fantasia e contos-de-fada escritos 2000 anos atrás pra suprir os nossos próprios desejos egóicos.

Pra finalizar: A perspectiva da "IA" te substituir nas tarefas que tu executa em planilhas de Excel o dia todo durante o expediente não tira nada do teu propósito enquanto ser vivo. É muito pequeno achar que é o trabalho que nos dá valor. Nada nos dá valor. Não somos importantes.

<blockquote>
You do not have to be good.

You do not have to walk on your knees

for a hundred miles through the desert repenting.

You only have to let the soft animal of your body

love what it loves.

Tell me about despair, yours, and I will tell you mine.

Meanwhile the world goes on.

Meanwhile the sun and the clear pebbles of the rain

are moving across the landscapes,

over the prairies and the deep trees,

the mountains and the rivers.

Meanwhile the wild geese, high in the clean blue air,

are heading home again.

Whoever you are, no matter how lonely,

the world offers itself to your imagination,

calls to you like the wild geese, harsh and exciting -

over and over announcing your place

in the family of things.

</blockquote>

Mary Oliver,
**Wild Geese**

<img src='/images/misc/sequence-ducks.gif'>

---
title: "Assessing Gender Bias in Machine Translation: a Case Study with Google Translate"
collection: publications
permalink: /publication/2019-03-27-assessing-gender-bias-in-machine-translation
excerpt: 'Recently there has been a growing concern in academia, industrial research laboratories and the mainstream commercial media about the phenomenon dubbed as machine bias, where trained statistical models—unbeknownst to their creators—grow to reflect controversial societal asymmetries, such as gender or racial bias. In this paper, we show that Google Translate exhibits a strong tendency toward male defaults when translation job-related sentences, in particular for fields typically associated to unbalanced gender distribution or stereotypes such as STEM (Science, Technology, Engineering and Mathematics) jobs. '
date: 2019-03-27
venue: 'Neural Computing and Applications'
paperurl: 'https://link.springer.com/article/10.1007/s00521-019-04144-6'
citation: 'Prates, M. O., Avelar, P. H., & Lamb, L. C. (2018). Assessing gender bias in machine translation: a case study with Google Translate. Neural Computing and Applications, 1-19.'
---
Recently there has been a growing concern in academia, industrial research laboratories and the mainstream commercial media about the phenomenon dubbed as machine bias, where trained statistical models—unbeknownst to their creators—grow to reflect controversial societal asymmetries, such as gender or racial bias. A significant number of Artificial Intelligence tools have recently been suggested to be harmfully biased toward some minority, with reports of racist criminal behavior predictors, Apple’s Iphone X failing to differentiate between two distinct Asian people and the now infamous case of Google photos’ mistakenly classifying black people as gorillas. Although a systematic study of such biases can be difficult, we believe that automated translation tools can be exploited through gender neutral languages to yield a window into the phenomenon of gender bias in AI. In this paper, we start with a comprehensive list of job positions from the U.S. Bureau of Labor Statistics (BLS) and used it in order to build sentences in constructions like “He/She is an Engineer” (where “Engineer” is replaced by the job position of interest) in 12 different gender neutral languages such as Hungarian, Chinese, Yoruba, and several others. We translate these sentences into English using the Google Translate API, and collect statistics about the frequency of female, male and gender neutral pronouns in the translated output. We then show that Google Translate exhibits a strong tendency toward male defaults, in particular for fields typically associated to unbalanced gender distribution or stereotypes such as STEM (Science, Technology, Engineering and Mathematics) jobs. We ran these statistics against BLS’ data for the frequency of female participation in each job position, in which we show that Google Translate fails to reproduce a real-world distribution of female workers. In summary, we provide experimental evidence that even if one does not expect in principle a 50:50 pronominal gender distribution, Google Translate yields male defaults much more frequently than what would be expected from demographic data alone. We believe that our study can shed further light on the phenomenon of machine bias and are hopeful that it will ignite a debate about the need to augment current statistical translation tools with debiasing techniques—which can already be found in the scientific literature. 

[Download paper here](https://arxiv.org/pdf/1809.02208.pdf)
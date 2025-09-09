---
title: "Multitask learning on graph neural networks-learning multiple graph centrality measures with a unified network"
date: "2018-09-11"
tags: []
categories: []
excerpt: "In this work, we showcase how Graph Neural Networks (GNN) can be engineered--with a very simple architecture--to solve the fundamental combinatorial problem of graph colouring. Our results show that the model, which achieves high accuracy upon training on random instances, is able to generalise to graph distributions different from those seen at training time."
original_path: "_publications/2019-03-11-multitask-learning-on-graph-neural-networks.md"
---

The application of deep learning to symbolic domains remains an active research endeavour. Graph neural networks (GNN), consisting of trained neural modules which can be arranged in different topologies at run time, are sound alternatives to tackle relational problems which lend themselves to graph representations. In this paper, we show that GNNs are capable of multitask learning, which can be naturally enforced by training the model to refine a single set of multidimensional embeddings ∈Rd and decode them into multiple outputs by connecting MLPs at the end of the pipeline. We demonstrate the multitask learning capability of the model in the relevant relational problem of estimating network centrality measures, focusing primarily on producing rankings based on these measures, i.e. is vertex v1 more central than vertex v2 given centrality c?. We then show that a GNN can be trained to develop a lingua franca of vertex embeddings from which all relevant information about any of the trained centrality measures can be decoded. The proposed model achieves 89% accuracy on a test dataset of random instances with up to 128 vertices and is shown to generalise to larger problem sizes. The model is also shown to obtain reasonable accuracy on a dataset of real world instances with up to 4k vertices, vastly surpassing the sizes of the largest instances with which the model was trained (n=128). Finally, we believe that our contributions attest to the potential of GNNs in symbolic domains in general and in relational learning in particular. 

[Download paper here](https://arxiv.org/pdf/1809.07695.pdf)

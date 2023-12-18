---
title: 'prettymaps'
date: 2021-11-16
excerpt: "<a href='/portfolio/2021-11-16-prettymaps/'><img src='https://github.com/marceloprates/prettymaps/blob/main/prints/heerhugowaard.png?raw=true' width='600'></a>"
tags: 
    - Generative Art
    - Cartography
    - OpenStreetMap
    - Maps
    - Python
---

<img src="https://github.com/marceloprates/prettymaps/blob/main/prints/heerhugowaard.png?raw=true" width="600" />

[Prettymaps](github.com/marceloprates/prettymaps) started as a simple personal project in an effort to organize and simplify my process of making stylized maps from OpenStreetMap data.

It received a lot of attention when I made it available as an open source project, reaching [the first place in Hacker News](https://github.com/marceloprates/prettymaps/blob/main/prints/hackernews-prettymaps.png?raw=true). It is now within the [2200 most starred Github repositories](https://gitstar-ranking.com/marceloprates/prettymaps).

## Usage example (For more examples, see [this Jupyter Notebook](https://nbviewer.jupyter.org/github/marceloprates/prettymaps/blob/main/notebooks/examples.ipynb)):

```python
# Init matplotlib figure
fig, ax = plt.subplots(figsize = (12, 12), constrained_layout = True)

backup = plot(
    # Address:
    'Praça Ferreira do Amaral, Macau',
    # Plot geometries in a circle of radius:
    radius = 1100,
    # Matplotlib axis
    ax = ax,
    # Which OpenStreetMap layers to plot and their parameters:
    layers = {
            # Perimeter (in this case, a circle)
            'perimeter': {},
            # Streets and their widths
            'streets': {
                'width': {
                    'motorway': 5,
                    'trunk': 5,
                    'primary': 4.5,
                    'secondary': 4,
                    'tertiary': 3.5,
                    'residential': 3,
                    'service': 2,
                    'unclassified': 2,
                    'pedestrian': 2,
                    'footway': 1,
                }
            },
            # Other layers:
            #   Specify a name (for example, 'building') and which OpenStreetMap tags to fetch
            'building': {'tags': {'building': True, 'landuse': 'construction'}, 'union': False},
            'water': {'tags': {'natural': ['water', 'bay']}},
            'green': {'tags': {'landuse': 'grass', 'natural': ['island', 'wood'], 'leisure': 'park'}},
            'forest': {'tags': {'landuse': 'forest'}},
            'parking': {'tags': {'amenity': 'parking', 'highway': 'pedestrian', 'man_made': 'pier'}}
        },
        # drawing_kwargs:
        #   Reference a name previously defined in the 'layers' argument and specify matplotlib parameters to draw it
        drawing_kwargs = {
            'background': {'fc': '#F2F4CB', 'ec': '#dadbc1', 'hatch': 'ooo...', 'zorder': -1},
            'perimeter': {'fc': '#F2F4CB', 'ec': '#dadbc1', 'lw': 0, 'hatch': 'ooo...',  'zorder': 0},
            'green': {'fc': '#D0F1BF', 'ec': '#2F3737', 'lw': 1, 'zorder': 1},
            'forest': {'fc': '#64B96A', 'ec': '#2F3737', 'lw': 1, 'zorder': 1},
            'water': {'fc': '#a1e3ff', 'ec': '#2F3737', 'hatch': 'ooo...', 'hatch_c': '#85c9e6', 'lw': 1, 'zorder': 2},
            'parking': {'fc': '#F2F4CB', 'ec': '#2F3737', 'lw': 1, 'zorder': 3},
            'streets': {'fc': '#2F3737', 'ec': '#475657', 'alpha': 1, 'lw': 0, 'zorder': 3},
            'building': {'palette': ['#FFC857', '#E9724C', '#C5283D'], 'ec': '#2F3737', 'lw': .5, 'zorder': 4},
        }
)
```
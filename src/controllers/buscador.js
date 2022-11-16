const search = async(req, res, next) => {
    const { term, sortBy } = req.query;
    const pageAsNumber = Number.parseInt(req.query.page);
    const sizeAsNumber = Number.parseInt(req.query.size);
    try {
        if (term) {
          const product = await Product.findAndCountAll({
            limit: sizes(sizeAsNumber),
            offset: +pages(pageAsNumber) * +sizes(sizeAsNumber),
            where: {
              name: {
                [Op.like]: "%" + term + "%",
              },
            },
            order: orderElements(sortBy),
          });
          return res.send({
            totalPages: Math.ceil(product.count / sizes(sizeAsNumber)),
            content: product.rows,
          });
        }
        next();
      } catch (error) {
        res.status(500).json(error);
      }
}
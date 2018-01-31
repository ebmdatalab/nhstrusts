# coding: utf-8
module Jekyll
  module YesNoFilter
    def yesno(input)
      if input and input.length == 1
        if input.downcase.strip == 'y' or input.to_i > 0
          "<span class='ballotbox tick'>yes</span>"
        else
          "<span class='ballotbox cross'>no</span>"
        end
      else
        input
      end
    end
    def tickcross(input)
      if input and input.length == 1
        if input.downcase.strip == 'y' or input.to_i > 0
          "<span class='ballotbox tick'><i class='far fa-check-square'></i></span>"
        else
          "<span class='ballotbox cross'><i class='far fa-square'></i></span>"
        end
      else
        input
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::YesNoFilter)

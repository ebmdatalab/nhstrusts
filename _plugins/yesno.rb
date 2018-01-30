# coding: utf-8
module Jekyll
  module YesNoFilter
    def yesno(input)
      if input and input.length == 1
        if input.downcase.strip == 'y' or input.to_i > 0
          "<span class='ballotbox tick'>☑</span>"
        else
          "<span class='ballotbox cross'>☒</span>"
        end
      else
        input
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::YesNoFilter)
